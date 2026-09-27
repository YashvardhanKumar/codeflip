import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coding Practice Problems & Algorithm Challenges',
  description:
    'Browse hundreds of algorithmic problems and coding challenges on CodeFlip. Filter by difficulty, tags, and run test cases online.',
  alternates: {
    canonical: 'https://www.codeflip.co.in/problems',
  },
  openGraph: {
    title: 'Coding Practice Problems & Algorithm Challenges | CodeFlip',
    description:
      'Browse hundreds of algorithmic problems and coding challenges on CodeFlip. Filter by difficulty, tags, and run test cases online.',
    url: 'https://www.codeflip.co.in/problems',
  },
}

export default function ProblemsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
