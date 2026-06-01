import { render, screen } from '@testing-library/react'
import ProblemTable from '../components/problem-table'
import useSWR from 'swr'

// Mock useSWR
jest.mock('swr')

const mockProblems = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Two Sum',
      difficulty: 'EASY',
      tags: [],
      created_at: '2026-05-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Longest Substring',
      difficulty: 'MEDIUM',
      tags: [],
      created_at: '2026-05-01T00:00:00Z',
    },
  ],
}

// Mock framer-motion to avoid animation issues in tests
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
  const DummyTr = ({ children, ...props }: any) => {
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
    return React.createElement('tr', validProps, children)
  }
  return {
    motion: {
      div: Dummy,
      tr: DummyTr,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

describe('ProblemTable', () => {
  const defaultProps = {
    page: 1,
    onPageChange: jest.fn(),
  }

  it('renders loading state', () => {
    render(<ProblemTable {...defaultProps} isLoading={true} />)
    // Should show skeletons or a loader
    const skeletons = screen.getAllByRole('row')
    // 1 header + 10 skeleton rows (as per ProblemTableSkeleton)
    expect(skeletons.length).toBeGreaterThan(1)
  })

  it('renders error state', () => {
    render(
      <ProblemTable
        {...defaultProps}
        isLoading={false}
        error={new Error('Failed to fetch')}
      />
    )
    expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument()
  })

  it('renders a list of problems', () => {
    render(
      <ProblemTable
        {...defaultProps}
        isLoading={false}
        data={mockProblems as any}
      />
    )

    expect(screen.getByText(/Two Sum/i)).toBeInTheDocument()
    expect(screen.getByText(/Longest Substring/i)).toBeInTheDocument()
    expect(screen.getByText(/EASY/i)).toBeInTheDocument()
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument()
  })
})
