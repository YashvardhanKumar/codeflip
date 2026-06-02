import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    'rehype-mathjax',
    'remark-math',
    'react-markdown',
    'rehype-raw',
    'remark-gfm',
  ],
}

export default nextConfig
