import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Route',
  robots: {
    index: false,
    follow: false,
  },
}

export default function TestRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
