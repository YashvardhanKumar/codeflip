// components/Sidebar.tsx
import useSWR from 'swr';
import FilterAccordion from './filter-accordion';
import { PaginatedResponse, Tag } from '@/lib/models';
import { Skeleton } from './ui/skeleton';
import { motion } from 'framer-motion';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import Link from 'next/link';
import { apiFetcher } from '@/lib/utils';

export default function Sidebar() {
  const { user } = useAuth();
  const { data: tags, isLoading } = useSWR<PaginatedResponse<Tag>>("tags/", apiFetcher)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
      {!user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-surface-border shadow-sm flex flex-col gap-4"
        >
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">login</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Track your progress</h4>
            <p className="text-xs text-slate-500 dark:text-text-secondary leading-relaxed">
              Sign in to save your solutions, track stats, and compete on the leaderboard.
            </p>
          </div>
          <Link href="/login" className="w-full">
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
              Sign In
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Filter Header for Mobile */}
      <div className="flex lg:hidden items-center justify-between">
        <h3 className="font-bold text-lg">Filters</h3>
        <button className="text-primary text-sm font-medium">Reset</button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {/* Status Accordion */}
        <motion.div variants={item}>
          <FilterAccordion
            icon="task_alt"
            title="Status"
            defaultOpen
          >
            <div className="pb-3 pt-1 flex flex-col gap-2">
              <CheckboxItem label="Solved" />
              <CheckboxItem label="Unsolved" />
              <CheckboxItem label="Attempted" />
            </div>
          </FilterAccordion>
        </motion.div>

        {/* Difficulty Accordion */}
        <motion.div variants={item}>
          <FilterAccordion
            icon="signal_cellular_alt"
            title="Difficulty"
            defaultOpen
          >
            <div className="pb-3 pt-1 flex flex-col gap-2">
              <CheckboxItem
                label="Easy"
                checkboxColor="checked:bg-green-500 checked:border-green-500"
                labelColor="text-green-600 dark:text-green-500"
              />
              <CheckboxItem
                label="Medium"
                checkboxColor="checked:bg-yellow-500 checked:border-yellow-500"
                labelColor="text-yellow-600 dark:text-yellow-500"
              />
              <CheckboxItem
                label="Hard"
                checkboxColor="checked:bg-red-500 checked:border-red-500"
                labelColor="text-red-600 dark:text-red-500"
              />
            </div>
          </FilterAccordion>
        </motion.div>

        {/* Tags Accordion */}
        <motion.div variants={item}>
          <FilterAccordion
            icon="label"
            title="Tags"
          >
            <div className="pb-3 pt-2 flex flex-wrap gap-2">
              {isLoading ? (
                <>
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-16" />
                  ))}
                </>
              ) : (
                tags?.results.map((t: Tag) => (
                  <span
                    key={t.id}
                    className="cursor-pointer px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-white transition-all transform hover:scale-105"
                  >
                    {t.tags}
                  </span>
                ))
              )}
            </div>
          </FilterAccordion>
        </motion.div>
      </motion.div>

      {/* Company Tags Promo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl bg-linear-to-br from-primary/20 to-transparent p-4 border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">business_center</span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Company Tags
            </h4>
            <p className="text-xs text-slate-500 dark:text-text-secondary mb-3">
              Unlock high-frequency problems from top companies.
            </p>
            <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
              Get Premium
            </button>
          </div>
        </div>
      </motion.div>
    </aside>
  );
}

// Checkbox Item Component
function CheckboxItem({
  label,
  checkboxColor = "checked:bg-primary checked:border-primary",
  labelColor = "text-slate-600 dark:text-text-secondary"
}: {
  label: string;
  checkboxColor?: string;
  labelColor?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group/item">
      <div className="relative flex items-center">
        <input
          className={`peer size-4 appearance-none rounded border border-slate-300 dark:border-slate-600 bg-transparent transition-all ${checkboxColor}`}
          type="checkbox"
        />
        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100 pointer-events-none">
          check
        </span>
      </div>
      <span className={`text-sm group-hover/item:text-primary transition-colors ${labelColor}`}>
        {label}
      </span>
    </label>
  );
}
