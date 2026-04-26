// components/problem/ProblemDescription.tsx
'use client';

import { useState, useEffect } from 'react';
import TabButton from '@/components/tab-button';
import DifficultyBadge from '@/components/difficulty-badge';
import CodeBlock from '@/components/code-block';
import { ResizablePanel } from '../ui/resizable';
import { Problem } from '@/lib/models';
import Script from 'next/script';

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
        {activeTab === 'submissions' && <div className="text-gray-400">Submissions content...</div>}
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