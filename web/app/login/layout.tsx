import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to CodeFlip to practice coding challenges, participate in contests, and track your ranking.',
  alternates: {
    canonical: 'https://www.codeflip.co.in/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
