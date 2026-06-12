import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

function getStaticRoutes(dir: string, baseRoute: string = ''): string[] {
  let routes: string[] = []

  try {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // Skip dynamic routes, route groups, and hidden folders
        if (
          !file.startsWith('[') &&
          !file.startsWith('(') &&
          !file.startsWith('_') &&
          file !== 'api'
        ) {
          routes = [
            ...routes,
            ...getStaticRoutes(fullPath, `${baseRoute}/${file}`),
          ]
        }
      } else if (file === 'page.tsx' || file === 'page.ts') {
        routes.push(baseRoute === '' ? '/' : baseRoute)
      }
    }
  } catch (error) {
    console.error('Error scanning for static routes:', error)
  }

  return routes
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.codeflip.co.in' // Replace with your actual domain

  // Path to the 'app' directory
  const appDir = path.join(process.cwd(), 'app')
  const staticPaths = getStaticRoutes(appDir)

  return staticPaths.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }))
}
