import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Write Solution',
  robots: {
    index: false,
    follow: true,
  },
}

export default function WriteSolutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
