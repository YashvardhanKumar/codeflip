import { MetadataRoute } from 'next'
import { slugify } from '@/lib/utils'

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
const envBase = process.env.NEXT_PUBLIC_BASE_URL
const apiBase = envBase && !envBase.includes('localhost') ? envBase : baseUrl

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

  let problemRoutes: MetadataRoute.Sitemap = []

  try {
    const res = await fetch(`${apiBase}/api/problems/?page_size=500`, {
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data = (await res.json()) as ProblemsApiResponse | ProblemItem[]
      const problems: ProblemItem[] = Array.isArray(data)
        ? data
        : data.results || []

      problemRoutes = problems.map((problem) => {
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
    }
  } catch (error) {
    console.error('Error fetching dynamic problems for sitemap:', error)
  }

  return [...staticRoutes, ...problemRoutes]
}
