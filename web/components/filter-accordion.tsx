// components/FilterAccordion.tsx
'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterAccordionProps {
  icon: string
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export default function FilterAccordion({
  icon,
  title,
  children,
  defaultOpen = false,
}: FilterAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-surface-border bg-white dark:bg-surface-dark group shadow-sm dark:shadow-none overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between px-4 py-3 list-none w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined transition-colors ${isOpen ? 'text-primary' : 'text-slate-400 dark:text-text-secondary'}`}
          >
            {icon}
          </span>
          <p
            className={`text-sm font-medium transition-colors ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-text-secondary'}`}
          >
            {title}
          </p>
        </div>
        <span
          className={`material-symbols-outlined text-slate-400 dark:text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
