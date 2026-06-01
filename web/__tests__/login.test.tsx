const mockPush = jest.fn()
const mockLogin = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/login',
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
import LoginPage from '../app/login/page'
import apiClient from '@/lib/utils'
import { toast } from 'sonner'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /Sign In to Race/i })[0]
    ).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const userData = { username: 'testuser', name: 'Test User' }
    ;(apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { token: 'fake-token', user: userData },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(
      screen.getAllByRole('button', { name: /Sign In to Race/i })[0]
    )

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('auth/login/', {
        username: 'testuser',
        password: 'password123',
      })
      expect(mockLogin).toHaveBeenCalledWith('fake-token', userData)
    })
  })

  it('handles login failure', async () => {
    ;(apiClient.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'wronguser' },
    })
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(
      screen.getAllByRole('button', { name: /Sign In to Race/i })[0]
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})
