'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import apiClient from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ShieldCheck, Zap, Code2 } from 'lucide-react'
import Logo from '@/components/logo'

export default function LoginPage() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await apiClient.post('auth/login/', formData)
      login(response.data.token, response.data.user)
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          'Login failed. Please check your credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google-oauth2' | 'github') => {
    // In a real production app, you'd either redirect to backend:
    // window.location.href = `${apiClient.defaults.baseURL}auth/login/${provider}/`;
    // Or use a library to get the access token and then POST to /auth/social/

    toast.info(
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon! Configuration required.`
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0a0b] overflow-hidden">
      {/* Decorative Side */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center space-y-8 px-12"
        >
          <div className="inline-flex p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <Logo />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Ready for the race?
            </h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Join the elite league of developers. Compete, solve, and outpace
              the rest.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              {
                icon: <Zap size={18} />,
                title: 'Real-time',
                desc: 'Live competition',
              },
              {
                icon: <ShieldCheck size={18} />,
                title: 'Secure',
                desc: 'Sandbox isolation',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="text-primary mb-2">{item.icon}</div>
                <div className="text-white font-bold text-sm">{item.title}</div>
                <div className="text-slate-500 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-8 left-8 lg:left-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all group"
          >
            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="font-medium text-sm">Return Home</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[400px] space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Log in to your account to continue your progress
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-xs uppercase tracking-widest font-bold text-slate-500"
                >
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="e.g. fast_coder"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    className="bg-white dark:bg-[#161618] border-slate-200 dark:border-white/5 h-12 focus:ring-2 focus:ring-primary/20 transition-all pl-4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs uppercase tracking-widest font-bold text-slate-500"
                  >
                    Password
                  </Label>
                  <Link
                    href="#"
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="bg-white dark:bg-[#161618] border-slate-200 dark:border-white/5 h-12 focus:ring-2 focus:ring-primary/20 transition-all pl-4"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  'Sign In to Race'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 dark:bg-[#0a0a0b] px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-11 dark:border-white/5 dark:bg-[#161618] hover:bg-slate-100 dark:hover:bg-white/5 font-bold"
                onClick={() => handleSocialLogin('google-oauth2')}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="h-4 w-4 mr-2"
                  alt="Google"
                />
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 dark:border-white/5 dark:bg-[#161618] hover:bg-slate-100 dark:hover:bg-white/5 font-bold"
                onClick={() => handleSocialLogin('github')}
              >
                <Code2 className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              New to CodeFlip?{' '}
              <Link
                href="/signup"
                className="text-primary hover:underline font-bold"
              >
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>

        <div className="p-8 text-center text-xs text-slate-400">
          © 2026 CodeFlip Platform. All rights reserved.
        </div>
      </div>
    </div>
  )
}
