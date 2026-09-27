import { MetadataRoute } from 'next'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProblemItem {
  id: number
  name?: string
  slug?: string
  created_at?: string
}

interface ProblemsApiResponse {
  count?: number
  results?: ProblemItem[]
}

const baseUrl = 'https://www.codeflip.co.in'

async function fetchProblemsList(): Promise<ProblemItem[]> {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL
  const urlsToTry = [
    'http://api:8000/api/problems/?page_size=500',
    `${envBase && !envBase.includes('localhost') ? envBase : baseUrl}/api/problems/?page_size=500`,
    'https://www.codeflip.co.in/api/problems/?page_size=500',
    'http://localhost:8000/api/problems/?page_size=500',
  ]

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        const data = (await res.json()) as ProblemsApiResponse | ProblemItem[]
        return Array.isArray(data) ? data : data.results || []
      }
    } catch {
      // Continue to next fallback endpoint
    }
  }

  return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/problems`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contest`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/discuss`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  const problems = await fetchProblemsList()
  const problemRoutes: MetadataRoute.Sitemap = problems.map((problem) => {
    const problemSlug =
      problem.slug || slugify(problem.name) || String(problem.id)
    return {
      url: `${baseUrl}/problems/${problemSlug}`,
      lastModified: problem.created_at
        ? new Date(problem.created_at)
        : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  })

  return [...staticRoutes, ...problemRoutes]
}
