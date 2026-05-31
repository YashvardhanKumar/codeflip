"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Code2, Zap, Trophy, Users, ChevronRight, Terminal } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/problems">
              <Button variant="ghost" className="font-bold">Go to Problems</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-border">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="z-10 max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap size={14} />
              <span>The ultimate coding race begins</span>
            </motion.div>
<motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">

              Master Your Code, <br /> 
              <span className="text-primary">Outpace the Rest.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-text-secondary mb-10 max-w-2xl mx-auto">
              CodeFlip is where developers sharpen their skills, compete in real-time, and climb the global leaderboard. Join thousands of developers today.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/problems">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Get Started
                  <ChevronRight className="ml-2" />
                </Button>
              </Link>
              {!user && (
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-slate-200 dark:border-surface-border transition-all hover:bg-slate-50 dark:hover:bg-surface-border">
                    Join Now
                  </Button>
                </Link>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16 relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-2xl -z-10 transform scale-95" />
              <div className="rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-background-dark p-2 shadow-2xl">
                <div className="rounded-xl border border-slate-100 dark:border-muted bg-slate-50 dark:bg-surface-dark p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-surface-border pb-2">
                    <div className="flex gap-1.5">
                      <div className="size-3 rounded-full bg-red-400" />
                      <div className="size-3 rounded-full bg-yellow-400" />
                      <div className="size-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mx-auto text-xs text-slate-400 flex items-center gap-1">
                      <Terminal size={12} />
                      solution.py
                    </div>
                  </div>
                  <pre className="text-left font-mono text-sm md:text-base text-slate-700 dark:text-slate-300 overflow-x-auto">
                    <code>{`def solve(n):
    # Optimized approach to finding the path
    dp = [0] * (n + 1)
    dp[0] = 1
    
    for i in range(1, n + 1):
        dp[i] = sum(dp[max(0, i-3):i])
        
    return dp[n]

# Output: 53798706
print(solve(42))`}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50 dark:bg-surface-dark/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why CodeFlip?</h2>
              <p className="text-slate-600 dark:text-text-secondary max-w-xl mx-auto">
                Built by developers for developers, focusing on performance, community, and skill growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Code2 className="text-blue-500" />,
                  title: "Rich Language Support",
                  desc: "Solve problems in C++, Python, Java, TypeScript, and more with our lightning-fast runner.",
                },
                {
                  icon: <Trophy className="text-yellow-500" />,
                  title: "Ranked Challenges",
                  desc: "Compete in weekly contests and win exclusive badges and rewards for your profile.",
                },
                {
                  icon: <Users className="text-green-500" />,
                  title: "Active Community",
                  desc: "Join discussions, share your solutions, and learn from top-tier competitive coders.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="size-12 rounded-xl bg-slate-50 dark:bg-surface-border flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-text-secondary">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to start your journey?</h2>
            <p className="text-lg text-slate-600 dark:text-text-secondary mb-10">
              Join our community of over 50,000 developers and start improving your skills today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/problems">
                <Button size="lg" variant="ghost">
                  Browse Problems
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-surface-border px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="flex gap-8 text-sm text-slate-500 dark:text-text-secondary">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-primary transition-colors">Discord</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
          <p className="text-sm text-slate-400">© 2026 CodeFlip. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
