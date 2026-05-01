// components/problem/ProblemDescription.tsx
'use client';

import { useState, useEffect } from 'react';
import TabButton from '@/components/tab-button';
import DifficultyBadge from '@/components/difficulty-badge';
import CodeBlock from '@/components/code-block';
import { ResizablePanel } from '../ui/resizable';
import { Problem, Solution, Status } from '@/lib/models';
import Script from 'next/script';
import { useAuth } from '@/components/auth-provider';
import useSWR from 'swr';
import { BASE_URL } from '@/lib/constants';
import { Loader } from '@/components/loader';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    MathJax: any;
  }
}

const tabs = [
  { id: 'description', label: 'Description', icon: 'description' },
  { id: 'editorial', label: 'Editorial', icon: 'edit_note' },
  { id: 'solutions', label: 'Solutions', icon: 'science' },
  { id: 'submissions', label: 'Submissions', icon: 'history' }
];

interface Props {
  problem: Problem
}

export default function ProblemDescription({ problem }: Props) {
  const [activeTab, setActiveTab] = useState('description');
  const { user } = useAuth();

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [problem, activeTab]);

  return (
    <ResizablePanel defaultSize={50} className="flex flex-col border-r border-surface-border bg-background-dark overflow-hidden relative">
      <Script id="mathjax-config" strategy="lazyOnload">
        {`
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
              displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
              processEscapes: true,
              processEnvironments: true
            },
            options: {
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
            }
          };
        `}
      </Script>
      <Script
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        strategy="lazyOnload"
      />
      {/* Tabs Header */}
      <div className="h-10 bg-surface-dark flex items-center px-2 gap-1 border-b border-surface-border shrink-0">
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 pb-20">
        {activeTab === 'description' && <DescriptionContent problem={problem} />}
        {activeTab === 'editorial' && <div className="text-gray-400">Editorial content...</div>}
        {activeTab === 'solutions' && <div className="text-gray-400">Solutions content...</div>}
        {activeTab === 'submissions' && (
          <SubmissionsTab problemId={problem.id} authenticated={!!user} />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full h-10 bg-surface-dark border-t border-surface-border flex items-center justify-between px-4 z-10">
        <button className="text-gray-400 hover:text-white text-xs flex items-center gap-1">
          <span className="material-symbols-outlined text-base">forum</span>
          Discussion (32)
        </button>
        <span className="text-xs text-gray-600">Copyright © 2025 Coderacer</span>
      </div>
    </ResizablePanel>
  );
}

function DescriptionContent({ problem }: Props) {
  const [showTags, setShowTags] = useState(false);

  return (
    <>
      {/* Title & Header */}
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">{problem.id}. {problem.name}</h1>
        <div className="flex gap-2">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">help</span>
          </a>
        </div>
      </div>

      {/* Chips */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <DifficultyBadge difficulty={problem.difficulty ?? 'EASY'} />
        <div className="h-5 w-px bg-gray-700" />
        <button 
          onClick={() => setShowTags(!showTags)}
          className="flex items-center gap-1 bg-surface-border hover:bg-muted px-2 py-0.5 rounded-full text-xs text-gray-300 transition-colors group"
        >
          <span className="material-symbols-outlined text-xs">sell</span>
          Topics
          <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${showTags ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
        </button>
      </div>

      {/* Tags List */}
      {showTags && problem.tags && problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in duration-200">
          {problem.tags.map((tag) => (
            <span 
              key={tag.id} 
              className="px-2 py-1 rounded bg-surface-border text-xs text-gray-400 font-medium hover:text-white transition-colors cursor-default"
            >
              {tag.tags}
            </span>
          ))}
        </div>
      )}

      {/* Problem Text */}
      <div className="text-sm text-gray-300 leading-relaxed space-y-4">
        <div dangerouslySetInnerHTML={{ __html: problem?.problem_description ?? '' }}></div>

        <div className="mt-12 border-t border-surface-border pt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="material-symbols-outlined text-gray-500 group-hover:text-green-500 transition-colors text-xl">thumb_up</span>
            <span className="text-gray-500 text-xs font-bold group-hover:text-white">24.5K</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="material-symbols-outlined text-gray-500 group-hover:text-red-500 transition-colors text-xl">thumb_down</span>
            <span className="text-gray-500 text-xs font-bold group-hover:text-white">1.2K</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer group ml-auto">
            <span className="material-symbols-outlined text-gray-500 group-hover:text-yellow-400 transition-colors text-xl">star</span>
            <span className="text-gray-500 text-xs font-bold group-hover:text-white">Add to List</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="material-symbols-outlined text-gray-500 group-hover:text-blue-400 transition-colors text-xl">share</span>
            <span className="text-gray-500 text-xs font-bold group-hover:text-white">Share</span>
          </div>
        </div>
      </div>
    </>
  );
}

function SubmissionsTab({ problemId, authenticated }: { problemId: number, authenticated: boolean }) {
  const fetcher = (url: string) => fetch(url, {
    headers: {
      'Authorization': `Token ${localStorage.getItem('token')}`
    }
  }).then((r) => r.json());

  const { data, error, isLoading } = useSWR(
    authenticated ? `${BASE_URL}/api/solutions/?problem_id=${problemId}` : null,
    fetcher
  );

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Clock size={48} className="text-gray-600" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Sign in to view submissions</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            You need to be logged in to track your progress and see your previous attempts.
          </p>
        </div>
        <Link href="/login">
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold transition-all">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  if (isLoading) return <div className="py-10"><Loader /></div>;
  
  if (error || !data) return (
    <div className="py-10 text-red-500 flex items-center gap-2">
      <AlertCircle size={20} />
      <span>Failed to load submissions</span>
    </div>
  );

  const submissions: Solution[] = Array.isArray(data) ? data : data.results || [];

  if (submissions.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="text-gray-500 italic">No submissions yet</div>
        <p className="text-gray-600 text-sm">Submit your code to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="text-lg font-bold text-white mb-6">Past Submissions</h3>
      <div className="w-full overflow-hidden rounded-xl border border-surface-border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-dark/50 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-background-dark">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {sub.status === Status.SUCCESS ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span className={`font-bold text-sm ${sub.status === Status.SUCCESS ? 'text-green-500' : 'text-red-500'}`}>
                      {sub.status_display}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-300">
                  {sub.language_display}
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">
                  {format(new Date(sub.created_at), 'MMM d, yyyy HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
