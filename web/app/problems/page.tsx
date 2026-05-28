"use client"

import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import DailyChallenge from '@/components/daily-challenge';
import ProblemTable from '@/components/problem-table';
import PageTransition from '@/components/page-transition';
import { Difficulty, PaginatedResponse, Problem } from '@/lib/models';
import { apiFetcher } from '@/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

export type ProgressFilter = 'solved' | 'unsolved' | 'attempted';
export type SortOption = 'recommended' | 'recent' | 'votes';

const sortToOrdering: Record<SortOption, string> = {
  recommended: 'id',
  recent: '-created_at',
  votes: '-total_solutions',
};

export default function ProblemsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ProgressFilter[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [sort, setSort] = useState<SortOption>('recommended');
  const [page, setPage] = useState(1);
  const [pickError, setPickError] = useState<string | null>(null);

  const problemQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set('search', search.trim());
    if (selectedStatuses.length) params.set('status', selectedStatuses.join(','));
    if (selectedDifficulties.length) params.set('difficulty', selectedDifficulties.join(','));
    if (selectedTags.length) params.set('tags', selectedTags.join(','));
    if (sortToOrdering[sort]) params.set('ordering', sortToOrdering[sort]);
    if (page > 1) params.set('page', String(page));

    const queryString = params.toString();
    return `problems/${queryString ? `?${queryString}` : ''}`;
  }, [page, search, selectedDifficulties, selectedStatuses, selectedTags, sort]);

  const { data, error, isLoading } = useSWR<PaginatedResponse<Problem>>(problemQuery, apiFetcher);

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateSort = (value: SortOption) => {
    setSort(value);
    setPage(1);
  };

  const toggleStatus = (status: ProgressFilter) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status]
    );
    setPage(1);
  };

  const toggleDifficulty = (difficulty: Difficulty) => {
    setSelectedDifficulties((current) =>
      current.includes(difficulty)
        ? current.filter((item) => item !== difficulty)
        : [...current, difficulty]
    );
    setPage(1);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((item) => item !== tagId)
        : [...current, tagId]
    );
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setSort('recommended');
    setPage(1);
    setPickError(null);
  };

  const pickRandomProblem = async () => {
    setPickError(null);
    const randomQuery = problemQuery.replace(/^problems\//, 'problems/random/');

    try {
      const problem = await apiFetcher<Problem>(randomQuery);
      router.push(`/problems/${problem.id}`);
    } catch {
      setPickError('No problem matches the current filters.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header />
      
      <PageTransition>
        <div className="flex-1 w-full max-w-350 mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
          <Sidebar
            selectedStatuses={selectedStatuses}
            selectedDifficulties={selectedDifficulties}
            selectedTags={selectedTags}
            onToggleStatus={toggleStatus}
            onToggleDifficulty={toggleDifficulty}
            onToggleTag={toggleTag}
            onReset={resetFilters}
          />
          
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Top Section: Daily Challenge & Heading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Heading Area */}
              <div className="md:col-span-2 flex flex-col justify-end gap-4 p-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Problems
                </h1>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={pickRandomProblem}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all transform cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">shuffle</span>
                    Pick One
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-surface-border text-slate-700 dark:text-text-secondary rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-300 dark:hover:bg-muted hover:scale-105 active:scale-95 transition-all transform"
                  >
                    <span className="material-symbols-outlined text-lg">restart_alt</span>
                    Reset
                  </button>
                </div>
                {pickError && (
                  <p className="text-sm text-red-500 dark:text-red-400">{pickError}</p>
                )}
              </div>

              <DailyChallenge />
              </div>

              {/* Problem List Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mt-2">
              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-slate-400 dark:text-text-secondary text-xl">
                    search
                  </span>
                </div>
                <input
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-slate-100 dark:bg-surface-border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-text-secondary focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all outline-hidden"
                  placeholder="Search questions by title or ID..."
                  type="text"
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <select
                  value={sort}
                  onChange={(event) => updateSort(event.target.value as SortOption)}
                  className="form-select bg-slate-100 dark:bg-surface-border border-none text-slate-700 dark:text-text-secondary text-sm rounded-lg py-2.5 pl-3 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all outline-hidden"
                >
                  <option value="recommended">Recommended</option>
                  <option value="recent">Most Recent</option>
                  <option value="votes">Most Submissions</option>
                </select>
              </div>
              </div>
            <ProblemTable
              data={data}
              error={error}
              isLoading={isLoading}
              page={page}
              onPageChange={setPage}
            />
          </main>
        </div>
      </PageTransition>
    </div>
  );
}
