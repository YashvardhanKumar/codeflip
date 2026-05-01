import { render, screen } from '@testing-library/react'
import ProblemsPage from '../app/problems/page'
import { AuthProvider } from '@/components/auth-provider'
import useSWR from 'swr'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/problems',
}))

// Mock useSWR
jest.mock('swr')

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
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
    } = props;
    return React.createElement('div', validProps, children);
  };
  return {
    motion: {
      div: Dummy,
      tr: Dummy,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
})

// Mock components that might be problematic in tests
jest.mock('@/components/problem-table', () => () => <div data-testid="problem-table">Problem Table</div>)
jest.mock('@/components/daily-challenge', () => () => <div data-testid="daily-challenge">Daily Challenge</div>)
jest.mock('@/components/sidebar', () => () => <div data-testid="sidebar">Sidebar</div>)
jest.mock('@/components/header', () => () => <div data-testid="header">Header</div>)

describe('ProblemsPage', () => {
  it('renders correctly', () => {
    ;(useSWR as jest.Mock).mockReturnValue({ data: null, error: null, isLoading: false })

    render(
      <AuthProvider>
        <ProblemsPage />
      </AuthProvider>
    )

    expect(screen.getByText(/Problems/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search questions/i)).toBeInTheDocument()
    expect(screen.getByTestId('problem-table')).toBeInTheDocument()
    expect(screen.getByTestId('daily-challenge')).toBeInTheDocument()
  })
})
