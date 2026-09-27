import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Developer Discussions, Interview Experiences & DSA Solutions',
  description:
    'Join the CodeFlip community forum. Discuss algorithm solutions, interview experiences, contest recaps, and technical advice with fellow developers.',
  alternates: {
    canonical: 'https://www.codeflip.co.in/discuss',
  },
  openGraph: {
    title: 'Developer Discussions & DSA Solutions | CodeFlip',
    description:
      'Join the CodeFlip community forum. Discuss algorithm solutions, interview experiences, contest recaps, and technical advice.',
    url: 'https://www.codeflip.co.in/discuss',
  },
}

export default function DiscussLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
