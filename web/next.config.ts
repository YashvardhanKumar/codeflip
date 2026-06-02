import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    'rehype-mathjax',
    'remark-math',
    'react-markdown',
    'rehype-raw',
    'remark-gfm',
  ],
}

export default nextConfig
