// components/DailyChallenge.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { PaginatedResponse, Problem } from '@/lib/models';
import { apiFetcher } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export default function DailyChallenge() {
  const { data, isLoading } = useSWR<PaginatedResponse<Problem>>(
    'problems/?ordering=id',
    apiFetcher
  );
  const problem = data?.results[0];
  const userTimezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
  const today = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: userTimezone,
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-4 flex flex-col justify-between gap-3">
        <div>
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-full rounded-lg mb-1" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex -space-x-2">
            <Skeleton className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark" />
            <Skeleton className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark" />
            <Skeleton className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark" />
          </div>
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-full rounded-xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark p-4 text-sm text-slate-500 dark:text-text-secondary">
        No daily challenge available.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/problems/${problem.id}`}
        className="relative block h-full overflow-hidden rounded-xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark shadow-sm dark:shadow-lg group cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl">
            emoji_events
          </span>
        </div>

        <div className="p-4 flex flex-col h-full justify-between gap-3 relative z-10">
          <div>
            <div className="flex justify-between items-start mb-1">
              <p className="text-slate-500 dark:text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Daily Challenge
              </p>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {today}
              </span>
            </div>
            <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {problem.name}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-slate-200 dark:bg-slate-700" />
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-slate-300 dark:bg-slate-600" />
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-slate-400 dark:bg-slate-500 flex items-center justify-center text-xs font-bold text-white">
                +99
              </div>
            </div>
            <span className="text-primary text-xs font-bold group-hover:underline">
              Solve Now →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
