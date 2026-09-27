import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Coding Contests & Competitive Programming Leaderboards',
  description:
    'Compete in real-time coding contests on CodeFlip. Test your speed and algorithmic accuracy against developers worldwide, win rating badges, and climb the leaderboard.',
  alternates: {
    canonical: 'https://www.codeflip.co.in/contest',
  },
  openGraph: {
    title: 'Live Coding Contests & Competitive Programming | CodeFlip',
    description:
      'Compete in real-time coding contests on CodeFlip. Test your speed and algorithmic accuracy against developers worldwide.',
    url: 'https://www.codeflip.co.in/contest',
  },
}

export default function ContestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
