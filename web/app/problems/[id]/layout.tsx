import type { Metadata } from 'next'
import { slugify } from '@/lib/utils'

interface ProblemData {
  id: number
  name: string
  problem_description?: string
  difficulty?: string
  tags?: Array<{ id: number; tags: string }>
}

function stripHtml(html?: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

async function getProblem(id: string): Promise<ProblemData | null> {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL
  const publicBase =
    envBase && !envBase.includes('localhost')
      ? envBase
      : 'https://www.codeflip.co.in'

  const baseUrls = ['http://api:8000', publicBase, 'http://localhost:8000']

  for (const baseUrl of baseUrls) {
    try {
      let res = await fetch(`${baseUrl}/api/problems/${id}/`, {
        next: { revalidate: 3600 },
      })

      // If 404 and id is a kebab-case slug, fallback to searching for problem by name
      if (!res.ok && !/^\d+$/.test(id)) {
        const searchTerm = id.replace(/-/g, ' ')
        const searchRes = await fetch(
          `${baseUrl}/api/problems/?search=${encodeURIComponent(searchTerm)}`,
          { next: { revalidate: 3600 } }
        )
        if (searchRes.ok) {
          const data = await searchRes.json()
          const list = Array.isArray(data) ? data : data?.results || []
          const match = list.find(
            (p: any) =>
              slugify(p.name) === id.toLowerCase() ||
              p.name.toLowerCase() === searchTerm.toLowerCase()
          )
          if (match) {
            res = await fetch(`${baseUrl}/api/problems/${match.id}/`, {
              next: { revalidate: 3600 },
            })
          }
        }
      }

      if (res.ok) {
        return (await res.json()) as ProblemData
      }
    } catch {
      // Try next base URL
    }
  }

  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const problem = await getProblem(id)

  if (!problem) {
    return {
      title: `Problem #${id} - Coding Challenge`,
      description: `Practice and solve coding problem #${id} on CodeFlip with automated test cases and multi-language support.`,
      alternates: {
        canonical: `https://www.codeflip.co.in/problems/${id}`,
      },
    }
  }

  const problemSlug = slugify(problem.name) || id
  const rawDesc = stripHtml(problem.problem_description)
  const truncatedDesc =
    rawDesc.length > 150 ? `${rawDesc.slice(0, 150)}...` : rawDesc
  const difficulty = problem.difficulty ? ` [${problem.difficulty}]` : ''

  return {
    title: `${problem.name}${difficulty} - Coding Problem & Solution`,
    description:
      truncatedDesc ||
      `Solve ${problem.name} on CodeFlip. Run test cases, analyze time complexity, and master algorithm problem solving.`,
    keywords: [
      problem.name,
      ...(problem.tags?.map((t) => t.tags) || []),
      'coding problem',
      'algorithm solution',
      'CodeFlip',
      'data structures',
    ],
    alternates: {
      canonical: `https://www.codeflip.co.in/problems/${problemSlug}`,
    },
    openGraph: {
      title: `${problem.name}${difficulty} | CodeFlip`,
      description:
        truncatedDesc ||
        `Solve ${problem.name} on CodeFlip with multi-language code runner.`,
      url: `https://www.codeflip.co.in/problems/${problemSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${problem.name}${difficulty} | CodeFlip`,
      description:
        truncatedDesc ||
        `Solve ${problem.name} on CodeFlip with multi-language code runner.`,
    },
  }
}

export default async function ProblemDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const problem = await getProblem(id)
  const problemSlug = problem ? slugify(problem.name) || id : id

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.codeflip.co.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Problems',
        item: 'https://www.codeflip.co.in/problems',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: problem?.name || `Problem ${id}`,
        item: `https://www.codeflip.co.in/problems/${problemSlug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  )
}
