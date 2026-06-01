'use client'

import { useState, useEffect } from 'react'
import { Discuss, Problem } from '@/lib/models'
import { apiFetch } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeMathjax from 'rehype-mathjax/svg'
import { Skeleton } from '../ui/skeleton'
import { AlertCircle, User as UserIcon, Calendar, Eye } from 'lucide-react'
import { formatInUserTimezone } from '@/lib/utils'
import CodeBlock from '../code-block'

interface Props {
  problem: Problem
}

export default function EditorialTab({ problem }: Props) {
  const [editorial, setEditorial] = useState<Discuss | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEditorial() {
      setIsLoading(true)
      try {
        const response = await apiFetch(
          `discussions/?problem_id=${problem.id}&is_editorial=true`
        )
        const data = await response.json()
        // data might be a paginated response or a list
        const results = Array.isArray(data) ? data : data.results || []
        if (results.length > 0) {
          setEditorial(results[0])
        }
      } catch (err) {
        console.error('Error fetching editorial:', err)
        setError('Failed to load editorial')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEditorial()
  }, [problem.id])

  if (isLoading) {
    return (
      <div className="space-y-4 py-4 animate-in fade-in duration-300">
        <Skeleton className="h-8 w-3/4 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="space-y-2 mt-8">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-full rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10 text-red-500 flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    )
  }

  if (!editorial) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-500">
        <span className="material-symbols-outlined text-4xl opacity-20">
          auto_stories
        </span>
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">
          No editorial available for this problem yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {editorial.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <UserIcon size={14} className="text-primary" />
            <span className="text-gray-300">{editorial.author.username}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>
              {formatInUserTimezone(editorial.created_at, 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye size={14} />
            <span>{editorial.views} views</span>
          </div>
        </div>
      </div>
      <div className="prose prose-invert max-w-none prose-sm prose-code:before:content-none prose-code:after:content-none border-t border-surface-border pt-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeMathjax]}
          components={{
            pre: ({ children }) => <>{children}</>,
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={match[1]}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {editorial.body}
        </ReactMarkdown>
      </div>
    </div>
  )
}
