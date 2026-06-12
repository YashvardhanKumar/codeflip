import { render, screen } from '@testing-library/react'
import ProblemsPage from '../app/problems/page'
import { AuthProvider } from '@/components/auth-provider'
import useSWR from 'swr'
import { describe, it, expect, jest } from 'bun:test'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/problems',
}))

// Mock useSWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
  mutate: jest.fn(),
}))

// Mock only components that don't have their own conflicting tests
// We avoid mocking ProblemTable here because it causes issues with its own test file in Bun
jest.mock('@/components/daily-challenge', () => ({
  __esModule: true,
  default: () => <div data-testid="daily-challenge">Daily Challenge</div>,
}))
jest.mock('@/components/sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}))
jest.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
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
      tr: Dummy,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

describe('ProblemsPage', () => {
  it('renders correctly', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    })

    render(
      <AuthProvider>
        <ProblemsPage />
      </AuthProvider>
    )

    expect(
      screen.getByRole('heading', { name: /Problems/i })
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search questions/i)).toBeInTheDocument()
    // Since ProblemTable is not mocked, it will render the real one.
    // With data=null, it should show the "No problems match" state or similar.
    expect(screen.getByText(/No problems match/i)).toBeInTheDocument()
    expect(screen.getByTestId('daily-challenge')).toBeInTheDocument()
  })
})
