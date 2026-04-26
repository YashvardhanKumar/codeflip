import Link from 'next/link';
import Pagination from './pagination';
import useSWR from 'swr';
import { BASE_URL } from '@/lib/constants';
import { Skeleton } from './ui/skeleton';
import { Problem } from '@/lib/models';
import { motion } from 'framer-motion';


const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProblemTable() {
    const { data, error, isLoading } = useSWR(`${BASE_URL}/api/problems/`, fetcher)

    if (isLoading) return <ProblemTableSkeleton />;

    if (error) return <div>Error: {error.message}</div>
    console.log(data);

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
                        {data?.results.map((problem: Problem, index: number) => (
                            <ProblemRow key={problem.id} problem={problem} index={index} />
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination />
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
                                <td className="px-6 py-5">
                                    <Skeleton className="h-4 w-64" />
                                </td>
                                <td className="px-6 py-5">
                                    <Skeleton className="h-4 w-14" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-surface-border">
                <Skeleton className="h-8 w-52 ml-auto" />
            </div>
        </div>
    );
}

// Problem Row Component
function ProblemRow({ problem, index }: { problem: Problem; index: number }) {
    const isEven = index % 2 === 1;

    const difficultyColors = {
        EASY: 'text-green-600 dark:text-green-500',
        MEDIUM: 'text-yellow-600 dark:text-yellow-500',
        HARD: 'text-red-600 dark:text-red-500'
    };

    const statusIcons = {
        solved: 'check_circle',
        attempted: 'hourglass_top'
    };

    const statusColors = {
        solved: 'text-green-500',
        attempted: 'text-yellow-500'
    };

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
            </td>
            <td className="px-6 py-4">
                <span className={`font-medium ${difficultyColors[problem.difficulty ?? 'EASY']}`}>
                    {problem.difficulty}
                </span>
            </td>
        </motion.tr>
    );
    }