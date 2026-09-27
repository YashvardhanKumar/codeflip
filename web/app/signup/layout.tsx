import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description:
    'Create a free CodeFlip account to solve algorithms, race against developers in real time, and prepare for technical interviews.',
  alternates: {
    canonical: 'https://www.codeflip.co.in/signup',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
