// components/Pagination.tsx
'use client';

interface PaginationProps {
  count: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  count,
  currentPage,
  pageSize,
  hasNext,
  hasPrevious,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const start = count === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, count);
  const visiblePages = Array.from(
    new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])
  ).filter((page) => page >= 1 && page <= totalPages);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-surface-dark">
      <div className="text-sm text-slate-500 dark:text-text-secondary">
        Showing{' '}
        <span className="font-medium text-slate-900 dark:text-white">{start}-{end}</span> of{' '}
        <span className="font-medium text-slate-900 dark:text-white">{count}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-500 dark:text-text-secondary transition-all active:scale-90 disabled:active:scale-100"
          disabled={!hasPrevious}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        
        {visiblePages.map((page, index) => (
          <span key={page} className="flex items-center gap-1">
            {index > 0 && page - visiblePages[index - 1] > 1 && (
              <span className="px-2 text-slate-400">...</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all hover:scale-110 active:scale-95 ${
                page === currentPage
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-text-secondary'
              }`}
            >
              {page}
            </button>
          </span>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-500 dark:text-text-secondary transition-all active:scale-90 disabled:active:scale-100"
          disabled={!hasNext}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
