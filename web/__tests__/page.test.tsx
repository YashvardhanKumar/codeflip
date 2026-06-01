import { render } from '@testing-library/react'
import Page from '../app/page'
import { AuthProvider } from '@/components/auth-provider'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react')
  const Dummy = ({ children, ...props }: any) => {
    const {
      whileInView,
      whileHover,
      whileTap,
      whileFocus,
      whileDrag,
      initial,
      animate,
      exit,
      variants,
      transition,
      viewport,
      ...validProps
    } = props
    return React.createElement('div', validProps, children)
  }
  return {
    motion: {
      div: Dummy,
      h1: Dummy,
      p: Dummy,
      tr: Dummy,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

describe('Home', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <Page />
      </AuthProvider>
    )
  })
})
