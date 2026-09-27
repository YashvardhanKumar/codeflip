'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth-provider'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Code2,
  Zap,
  Trophy,
  Users,
  ChevronRight,
  Terminal,
  Sparkles,
  Bot,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Layers,
  Cpu,
  BookOpen,
  MessageSquare,
  Flame,
  Award,
  HelpCircle,
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface LandingPageContentProps {
  faqData?: FAQItem[]
}

export default function LandingPageContent({
  faqData = [],
}: LandingPageContentProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'python' | 'cpp' | 'java'>(
    'python'
  )

  useEffect(() => {
    if (!loading && user) {
      router.replace('/problems')
    }
  }, [user, loading, router])

  if (!loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Redirecting to your problems...
          </p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  const codeSnippets = {
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Hash Map: O(N) Time | O(N) Space
        seen = {}
        for i, val in enumerate(nums):
            complement = target - val
            if complement in seen:
                return [seen[complement], i]
            seen[val] = i
        return []

# Test Run: nums = [2, 7, 11, 15], target = 9
# Status: ACCEPTED (Runtime: 38ms, Memory: 17.8MB)`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Unordered Map: O(N) Time | O(N) Space
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // HashMap: O(N) Time | O(N) Space
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-background-dark/80 border-b border-slate-200/80 dark:border-surface-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/problems"
                className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Problems
              </Link>
              <Link
                href="/contest"
                className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Trophy size={15} className="text-yellow-500" />
                Contests
              </Link>
              <Link
                href="/discuss"
                className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Discussions
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-border"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="z-10 max-w-5xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold mb-6"
            >
              <Zap size={14} className="fill-primary" />
              <span>
                Real-Time Coding Races • In-Depth Editorials • AI Discussions
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-300"
            >
              Master Your Code, <br />
              <span className="text-primary">Outpace the Rest.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              CodeFlip is the next-generation competitive coding platform. Solve
              curated algorithmic problems, compete in weekly live contests,
              read exhaustive problem editorials with Big-O breakdowns, and
              leverage built-in AI to format discussions and uncover tricky edge
              cases.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4 mb-14"
            >
              <Link href="/problems">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Browse Problems
                  <ChevronRight className="ml-1.5" size={18} />
                </Button>
              </Link>
              <Link href="/contest">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-12 border-slate-300 dark:border-surface-border font-bold hover:bg-slate-100 dark:hover:bg-surface-border transition-all"
                >
                  <Trophy size={18} className="mr-2 text-yellow-500" />
                  Live Contests
                </Button>
              </Link>
              <Link href="/discuss">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-base px-6 h-12 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-border"
                >
                  Community Discussions
                </Button>
              </Link>
            </motion.div>

            {/* Interactive Code IDE Preview Card */}
            <motion.div
              variants={itemVariants}
              className="relative max-w-4xl mx-auto text-left"
            >
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-2xl -z-10 transform scale-95" />
              <div className="rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-background-dark p-2 shadow-2xl">
                <div className="rounded-xl border border-slate-100 dark:border-muted bg-slate-900 text-slate-100 overflow-hidden">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-red-500/80" />
                      <div className="size-3 rounded-full bg-yellow-500/80" />
                      <div className="size-3 rounded-full bg-green-500/80" />
                      <span className="ml-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <Terminal size={13} className="text-primary" />
                        two_sum_solution
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(['python', 'cpp', 'java'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveTab(lang)}
                          className={`text-xs px-2.5 py-1 rounded font-mono transition-colors ${
                            activeTab === lang
                              ? 'bg-primary text-white font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Editor Body */}
                  <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-200 bg-slate-900/90">
                    <pre>
                      <code>{codeSnippets[activeTab]}</code>
                    </pre>
                  </div>

                  {/* Status Bar */}
                  <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-green-400 font-medium">
                        <CheckCircle2 size={13} /> All 3/3 Test Cases Passed
                      </span>
                      <span>Runtime: 38 ms</span>
                      <span>Complexity: O(N) Time, O(N) Space</span>
                    </div>
                    <span className="text-slate-500">
                      GCC / Python 3.8 / OpenJDK 13
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Section 1: Problems and Solutions */}
        <section className="py-20 bg-slate-50 dark:bg-surface-dark/40 border-y border-slate-200 dark:border-surface-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
                <Code2 size={14} />
                <span>Extensive Problem Catalog</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Curated Algorithmic Problems & Verified Solutions
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                Build rock-solid technical fundamentals. Filter problems across
                key data structures, solve with real-time testcase execution,
                and learn optimal approaches for top-tier tech interviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="p-6 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-xs hover:shadow-md transition-shadow">
                <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2.5">
                  Topic-Wise Categorization
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  Master every critical domain: Dynamic Programming, Graph
                  Traversals (BFS/DFS), Binary Trees, Two Pointers, Sliding
                  Window, Monotonic Stacks, and Bitwise operations.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Arrays', 'DP', 'Graphs', 'Trees', 'Hash Tables'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-border text-xs font-mono text-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-xs hover:shadow-md transition-shadow">
                <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5">
                  <Cpu size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2.5">
                  Multi-Language Code Runner
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  Run and test your algorithms instantly in isolated Docker
                  environments. Full support for C++ (GCC 9.2), Python 3.8, Java
                  13, JavaScript, and TypeScript with sub-second execution
                  metrics.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['C++ 17', 'Python 3', 'Java 13', 'TypeScript'].map(
                    (lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-border text-xs font-mono text-slate-700 dark:text-slate-300"
                      >
                        {lang}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-xs hover:shadow-md transition-shadow">
                <div className="size-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2.5">
                  Instant Edge-Case Verification
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  Run against comprehensive system testcases, including boundary
                  inputs, maximum constraints, and negative edge cases. Prevent
                  Time Limit Exceeded (TLE) and Memory Exceeded crashes.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Zero Boundary', 'Max Constraints', 'TLE Checks'].map(
                    (item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-border text-xs font-mono text-slate-700 dark:text-slate-300"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/problems">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
                  View All Problems
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Problem Editorials & Complexity Breakdowns */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4">
                  <BookOpen size={14} />
                  <span>Deep-Dive Editorials</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                  Step-by-Step Problem Editorials with Big-O Complexity
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                  Never get stuck without understanding the underlying patterns.
                  Each problem features exhaustive editorial explanations
                  designed to build mental models, mathematical proofs, and
                  optimal code architectures.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">
                        Intuition & Mathematical Derivation
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Understand the mental leaps required to transform a
                        complex problem into an elegant algorithm.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">
                        Brute Force to Optimal Progression
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        See why naive $O(N^2)$ approaches choke on large
                        constraints and how hash indexing or divide-and-conquer
                        achieves $O(N)$ or $O(\log N)$.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">
                        Rigorous Time & Space Complexity
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Clear asymptotic breakdowns for memory footprint and
                        execution cycles with clear Big-O proofs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editorial Graphic Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-surface-border mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-primary" size={20} />
                    <span className="font-bold text-sm">
                      Editorial Preview: Two Sum
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500">
                    EASY
                  </span>
                </div>

                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-surface-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Approach 1: One-Pass Hash Table
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      While iterating through the array, we check if the
                      complement (<code>target - nums[i]</code>) exists in our
                      hash map. If present, we return both indices in $O(1)$
                      lookup time.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Time Complexity
                      </div>
                      <div className="text-base font-bold text-primary font-mono mt-0.5">
                        O(N)
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Single pass traversal
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Space Complexity
                      </div>
                      <div className="text-base font-bold text-primary font-mono mt-0.5">
                        O(N)
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Hash map storage
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-background-dark font-mono text-xs text-slate-800 dark:text-slate-200">
                    <code>
                      {`seen = {}\nfor i, val in enumerate(nums):\n    if target - val in seen:\n        return [seen[target - val], i]\n    seen[val] = i`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Live Coding Contests */}
        <section className="py-20 bg-slate-50 dark:bg-surface-dark/40 border-y border-slate-200 dark:border-surface-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold mb-3">
                <Trophy size={14} />
                <span>Live Ranked Competitions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Compete in Real-Time Timed Coding Contests
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                Sharpen your coding speed under real contest conditions. Race
                against coders worldwide, earn Elo rating points, and track your
                global standing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="p-6 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-xs">
                <div className="size-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-5">
                  <Flame size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2.5">Weekly Speed Races</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Fast-paced 60-to-90 minute contests testing problem analysis,
                  code correctness, and edge-case handling against a live
                  countdown clock.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-xs">
                <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5">
                  <Award size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2.5">
                  Dynamic Rating System
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Earn competitive rating points after each contest. Climb from
                  Bronze to Grandmaster and display verified contest badges
                  directly on your profile.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-xs">
                <div className="size-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2.5">Global Leaderboard</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Measure your performance against top university and industry
                  programmers. Review contest rankings, time splits, and penalty
                  breakdowns.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/contest">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
                  <Trophy size={16} className="mr-2 text-yellow-400" />
                  Explore Upcoming Contests
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4: AI-Assisted Discussions & Community */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* AI Showcase Card */}
              <div className="order-2 lg:order-1 p-6 sm:p-8 rounded-2xl bg-linear-to-br from-primary/10 via-slate-900 to-slate-950 border border-primary/30 shadow-2xl text-slate-100">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <Bot size={22} />
                  <span className="font-bold text-sm tracking-wide uppercase">
                    CodeFlip AI Assistant
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                      <Sparkles size={14} className="text-yellow-400" />
                      <span>Writing Discussion Using AI</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      "Help me write a discussion post explaining how to solve
                      Two Sum in Python with $O(N)$ time complexity and
                      edge-case diagrams."
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-primary/30">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                      <CheckCircle2 size={14} />
                      <span>AI Generated Post Draft</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      <strong>Summary:</strong> Using a single-pass hash map, we
                      eliminate the inner nested loop. Here is the complete
                      intuition, LaTeX complexity proof, and tested Python 3
                      implementation:
                    </p>
                    <div className="px-3 py-2 rounded-lg bg-black/60 font-mono text-xs text-green-400">
                      ✓ Formatted with Syntax Highlighting & Big-O Summary
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-4">
                  <Sparkles size={14} />
                  <span>AI Powered Community</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                  Write Discussions & Analyze Algorithms with Built-In AI
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                  Empower your learning process. Whether drafting insightful
                  discussion write-ups, generating edge cases, or seeking hints
                  without spoilers, CodeFlip's AI assistant supercharges your
                  developer journey.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">
                        Writing Discussion Using AI
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Instantly turn rough algorithmic intuition into
                        publication-ready discussion posts complete with code
                        blocks and mathematical formulas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">
                        Automated Edge-Case Generation
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Stuck on why your code fails? Synthesize corner test
                        cases (integer overflow, empty inputs, single elements)
                        automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">
                        Vibrant Developer Community
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Read verified FAANG interview experiences, share code
                        optimization tricks, and upvote the most helpful peer
                        solutions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="/discuss">
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
                      Visit Discussion Forum
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: SEO FAQ Accordion */}
        <section className="py-20 bg-slate-50 dark:bg-surface-dark/40 border-t border-slate-200 dark:border-surface-border">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                <HelpCircle size={14} />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Everything You Need to Know About CodeFlip
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                Answers to common questions regarding our coding platform, live
                contests, editorials, and AI tools.
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-background-dark overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-base sm:text-lg hover:text-primary transition-colors cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-100 dark:border-surface-border">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Section 6: Final CTA */}
        <section className="py-20 relative overflow-hidden bg-background-light dark:bg-background-dark">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Ready to Outpace the Rest?
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of software engineers mastering data structures,
              climbing contest leaderboards, and preparing for top technical
              interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link href="/problems">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base px-8 h-12 border-slate-300 dark:border-surface-border font-bold hover:bg-slate-100 dark:hover:bg-surface-border"
                >
                  Explore Practice Problems
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced SEO Footer */}
      <footer className="py-14 border-t border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-background-dark px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              CodeFlip is a competitive coding and algorithm preparation
              platform featuring live contests, exhaustive problem editorials,
              and AI-powered discussions.
            </p>
            <p className="text-xs text-slate-400">
              © 2026 CodeFlip. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/problems"
                  className="hover:text-primary transition-colors"
                >
                  Practice Problems
                </Link>
              </li>
              <li>
                <Link
                  href="/contest"
                  className="hover:text-primary transition-colors"
                >
                  Live Contests & Races
                </Link>
              </li>
              <li>
                <Link
                  href="/discuss"
                  className="hover:text-primary transition-colors"
                >
                  Community Discussions
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-primary transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* DSA Topics */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-900 dark:text-white">
              DSA Topics
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/problems?tags=Dynamic%20Programming"
                  className="hover:text-primary transition-colors"
                >
                  Dynamic Programming
                </Link>
              </li>
              <li>
                <Link
                  href="/problems?tags=Array"
                  className="hover:text-primary transition-colors"
                >
                  Arrays & Two Pointers
                </Link>
              </li>
              <li>
                <Link
                  href="/problems?tags=Tree"
                  className="hover:text-primary transition-colors"
                >
                  Binary Trees & BST
                </Link>
              </li>
              <li>
                <Link
                  href="/problems?tags=Graph"
                  className="hover:text-primary transition-colors"
                >
                  Graphs & BFS / DFS
                </Link>
              </li>
              <li>
                <Link
                  href="/problems?tags=Hash%20Table"
                  className="hover:text-primary transition-colors"
                >
                  Hash Tables & Maps
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Support */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-900 dark:text-white">
              Connect & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="mailto:support@codeflip.co.in"
                  className="hover:text-primary transition-colors"
                >
                  support@codeflip.co.in
                </a>
              </li>
              <li>
                <a
                  href="mailto:founder@codeflip.co.in"
                  className="hover:text-primary transition-colors"
                >
                  Contact Founder
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/coderacer-web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/codeflip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
