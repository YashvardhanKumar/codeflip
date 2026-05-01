// components/Pagination.tsx
'use client'

export default function Pagination() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-surface-dark">
      <div className="text-sm text-slate-500 dark:text-text-secondary">
        Showing{' '}
        <span className="font-medium text-slate-900 dark:text-white">1-50</span>{' '}
        of{' '}
        <span className="font-medium text-slate-900 dark:text-white">
          2,842
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-500 dark:text-text-secondary transition-all active:scale-90 disabled:active:scale-100"
          disabled
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <button className="px-3 py-1 rounded bg-primary text-white text-sm font-medium transition-all hover:scale-110 active:scale-95 shadow-md shadow-primary/20">
          1
        </button>

        <button className="px-3 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-text-secondary text-sm font-medium transition-all hover:scale-110 active:scale-95">
          2
        </button>

        <button className="px-3 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-text-secondary text-sm font-medium transition-all hover:scale-110 active:scale-95">
          3
        </button>

        <span className="px-2 text-slate-400">...</span>

        <button className="px-3 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-text-secondary text-sm font-medium transition-all hover:scale-110 active:scale-95">
          57
        </button>

        <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-text-secondary transition-all active:scale-90">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
