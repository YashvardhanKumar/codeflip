import { render, screen } from '@testing-library/react'
import ProblemDetailPage from '../app/problems/[id]/page'
import { AuthProvider } from '@/components/auth-provider'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { describe, it, expect, jest } from 'bun:test'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useParams: jest.fn(),
  usePathname: () => '/problems/1',
}))

// Mock useSWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
  mutate: jest.fn(),
}))

// Mock components
jest.mock('@/components/problem/code-editor', () => ({
  __esModule: true,
  default: () => <div data-testid="code-editor">Code Editor</div>,
}))
jest.mock('@/components/problem/problem-description', () => ({
  __esModule: true,
  default: () => <div data-testid="problem-description">Description</div>,
}))
jest.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="problem-header">Header</div>,
}))

// Mock react-resizable-panels
jest.mock('react-resizable-panels', () => ({
  PanelGroup: ({ children }: any) => (
    <div data-testid="panel-group">{children}</div>
  ),
  Panel: ({ children }: any) => <div data-testid="panel">{children}</div>,
  PanelResizeHandle: ({ children }: any) => (
    <div data-testid="resize-handle">{children}</div>
  ),
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
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

// Mock apiClient
jest.mock('@/lib/utils', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: {
      baseURL: 'http://localhost:8000',
      headers: { common: {} },
    },
  },
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}))

describe('ProblemDetailPage', () => {
  it('renders loader while fetching', () => {
    ;(useParams as jest.Mock).mockReturnValue({ id: '1' })
    ;(useSWR as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    })

    render(
      <AuthProvider>
        <ProblemDetailPage />
      </AuthProvider>
    )

    // Check for "problem-header" to verify the page structure is rendering
    expect(screen.getByTestId('problem-header')).toBeInTheDocument()
  })

  it('renders problem details when loaded', () => {
    ;(useParams as jest.Mock).mockReturnValue({ id: '1' })
    ;(useSWR as jest.Mock).mockReturnValue({
      data: { id: 1, name: 'Two Sum', testcases: [] },
      error: null,
      isLoading: false,
    })

    render(
      <AuthProvider>
        <ProblemDetailPage />
      </AuthProvider>
    )

    expect(screen.getByTestId('problem-header')).toBeInTheDocument()
    expect(screen.getByTestId('problem-description')).toBeInTheDocument()
    expect(screen.getByTestId('code-editor')).toBeInTheDocument()
  })

  it('renders error state', () => {
    ;(useParams as jest.Mock).mockReturnValue({ id: '1' })
    ;(useSWR as jest.Mock).mockReturnValue({
      data: null,
      error: true,
      isLoading: false,
    })

    render(
      <AuthProvider>
        <ProblemDetailPage />
      </AuthProvider>
    )

    expect(screen.getByText(/Error loading problem/i)).toBeInTheDocument()
  })
})
