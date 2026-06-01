import Link from 'next/link';
import Pagination from './pagination';
import { Skeleton } from './ui/skeleton';
import { PaginatedResponse, Problem } from '@/lib/models';
import { motion } from 'framer-motion';

interface ProblemTableProps {
    data?: PaginatedResponse<Problem>;
    error?: Error;
    isLoading: boolean;
    page: number;
    onPageChange: (page: number) => void;
}

export default function ProblemTable({ data, error, isLoading, page, onPageChange }: ProblemTableProps) {
    if (isLoading) return <ProblemTableSkeleton />;

    if (error) return <div>Error: {error.message}</div>

    const problems = data?.results ?? [];

    return (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm dark:shadow-none animate-in fade-in duration-700">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-surface-dark border-b border-slate-200 dark:border-surface-border text-xs uppercase text-slate-500 dark:text-text-secondary font-medium">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4 w-32">Difficulty</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-surface-border text-sm">
                        {problems.length > 0 ? (
                            problems.map((problem: Problem, index: number) => (
                                <ProblemRow key={problem.id} problem={problem} index={index} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="px-6 py-12 text-center text-slate-500 dark:text-text-secondary">
                                    No problems match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                count={data?.count ?? 0}
                currentPage={page}
                pageSize={20}
                hasNext={Boolean(data?.next)}
                hasPrevious={Boolean(data?.previous)}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function ProblemTableSkeleton() {
    return (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm dark:shadow-none">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-surface-dark border-b border-slate-200 dark:border-surface-border text-xs uppercase text-slate-500 dark:text-text-secondary font-medium">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4 w-32">Difficulty</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-surface-border text-sm">
                        {[...Array(10)].map((_, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-72 rounded" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-5 w-16 rounded" />
                                            <Skeleton className="h-5 w-20 rounded" />
                                            <Skeleton className="h-5 w-14 rounded" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-surface-border">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// Problem Row Component
function ProblemRow({ problem, index }: { problem: Problem; index: number }) {
  const isEven = index % 2 === 1

  const difficultyColors = {
    EASY: 'text-green-600 dark:text-green-500',
    MEDIUM: 'text-yellow-600 dark:text-yellow-500',
    HARD: 'text-red-600 dark:text-red-500',
  }

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`group hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors ${isEven ? 'bg-slate-50/50 dark:bg-surface-dark' : ''
                }`}
        >
            <td className="px-6 py-4">
                <Link
                    href={`/problems/${problem.id}`}
                    className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-all block group-hover:translate-x-1"
                >
                    {problem.id}. {problem.name}
                </Link>
                {problem.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {problem.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag.id}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-text-secondary"
                            >
                                {tag.tags}
                            </span>
                        ))}
                    </div>
                )}
            </td>
            <td className="px-6 py-4">
                <span className={`font-medium ${difficultyColors[problem.difficulty ?? 'EASY']}`}>
                    {problem.difficulty}
                </span>
            </td>
        </motion.tr>
    );
    }
