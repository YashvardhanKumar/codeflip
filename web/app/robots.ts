import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/',
        '/auth-callback',
        '/test-route',
        '/profile',
        '/api/',
        '/*/write-solution',
      ],
    },
    sitemap: 'https://www.codeflip.co.in/sitemap.xml',
    host: 'https://www.codeflip.co.in',
  }
}
