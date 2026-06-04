'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import apiClient from '@/lib/utils'
import { toast } from 'sonner'
import { Loader } from '@/components/loader'

function AuthCallbackContent() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      toast.error('Authentication failed: No token received.')
      router.push('/login')
      return
    }

    const fetchUserAndLogin = async () => {
      try {
        // Set the token temporarily for the user profile request
        // The actual login() call will set it permanently in localStorage
        const response = await apiClient.get('auth/users/me/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        })

        login(token, response.data)
      } catch (error) {
        console.error('Failed to complete social login', error)
        toast.error('Failed to fetch user profile after social login.')
        router.push('/login')
      }
    }

    fetchUserAndLogin()
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-[#0a0a0b]">
      <Loader />
      <p className="text-slate-500 animate-pulse font-medium">
        {' '}
        Completing secure login...{' '}
      </p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0b]">
          <Loader />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
