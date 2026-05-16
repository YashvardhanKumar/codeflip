const mockPush = jest.fn()
const mockLogin = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/signup',
}))

// Mock useAuth
const mockUseAuth = {
  login: mockLogin,
  user: null,
  token: null,
  loading: false,
  logout: jest.fn(),
  refreshUser: jest.fn(),
}

jest.mock('@/components/auth-provider', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => mockUseAuth,
}))

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

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignupPage from '../app/signup/page'
import apiClient from '@/lib/utils'
import { toast } from 'sonner'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders signup form', () => {
    render(<SignupPage />)
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Password/i)[0]).toBeInTheDocument()
  })

  it('validates matching passwords', async () => {
    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getAllByLabelText(/Password/i)[0], {
      target: { value: 'pass1' },
    })
    fireEvent.change(screen.getByLabelText(/Confirm/i), {
      target: { value: 'pass2' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /Create Free Account/i })
    )

    expect(toast.error).toHaveBeenCalledWith('Passwords do not match')
  })

  it('handles successful signup', async () => {
    const userData = { username: 'testuser', email: 'test@example.com' }
    ;(apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { token: 'fake-token', user: userData },
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getAllByLabelText(/Password/i)[0], {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/Confirm/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /Create Free Account/i })
    )

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/register/',
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
        })
      )
      expect(mockLogin).toHaveBeenCalledWith('fake-token', userData)
    })
  })
})
