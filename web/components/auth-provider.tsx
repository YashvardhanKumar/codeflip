'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import apiClient from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/models'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    delete apiClient.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
    router.push('/')
  }, [router])

  const login = useCallback(
    (newToken: string, newUser: User) => {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
      apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`
      toast.success(`Welcome back, ${newUser.name || newUser.username}!`)
      router.push('/problems')
    },
    [router]
  )

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/users/me/')
      setUser(response.data)
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      console.error('Failed to refresh user', error)
      logout()
    }
  }, [logout])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      apiClient.defaults.headers.common['Authorization'] =
        `Token ${storedToken}`
      // Verify token/refresh user data
      apiClient
        .get('/auth/users/me/')
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        })
        .catch(() => {
          logout()
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
