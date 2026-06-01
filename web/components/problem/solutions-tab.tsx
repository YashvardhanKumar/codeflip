'use client'

import { useState, useMemo } from 'react'
import { Discuss, Problem, Tag } from '@/lib/models'
import useSWR from 'swr'
import { apiFetcher, formatInUserTimezone } from '@/lib/utils'
import {
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  Eye,
  Plus,
  User as UserIcon,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Link from 'next/link'
import { SubmissionSkeleton } from '../loader'

interface Props {
  problem: Problem
  onViewSolution: (solution: Discuss) => void
}

export default function SolutionsTab({ problem, onViewSolution }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { data, error, isLoading } = useSWR<any>(
    `discussions/?problem_id=${problem.id}`,
    apiFetcher
  )

  const solutions = useMemo(() => {
    const results = Array.isArray(data) ? data : data?.results || []
    return results as Discuss[]
  }, [data])

  const filteredSolutions = useMemo(() => {
    return solutions.filter((sol) => {
      const matchesSearch =
        sol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sol.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sol.tags.some((t) =>
          t.tags.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((st) => sol.tags.some((t) => t.tags === st))

      return matchesSearch && matchesTags
    })
  }, [solutions, searchQuery, selectedTags])

  const allTags = useMemo(() => {
    const tagsMap = new Map<string, Tag>()
    solutions.forEach((sol) => {
      sol.tags.forEach((tag) => tagsMap.set(tag.tags, tag))
    })
    return Array.from(tagsMap.values())
  }, [solutions])

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    )
  }

  if (isLoading)
    return (
      <div className="py-4">
        <SubmissionSkeleton />
      </div>
    )
  if (error)
    return <div className="py-10 text-red-500">Failed to load solutions.</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Actions Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <Input
            placeholder="Search solutions..."
            className="pl-9 bg-surface-dark border-surface-border h-9 text-xs focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 border-surface-border text-xs gap-2 ${isFilterOpen ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-dark'}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter size={14} />
          Filter
          {selectedTags.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-4 px-1 text-[10px] bg-primary text-white"
            >
              {selectedTags.length}
            </Badge>
          )}
        </Button>
        <Link href={`/problems/${problem.id}/write-solution`}>
          <Button
            size="sm"
            className="h-9 bg-primary hover:bg-primary/90 text-xs gap-2 font-bold"
          >
            <Plus size={14} />
            Write Solution
          </Button>
        </Link>
      </div>

      {/* Tags Filter Panel */}
      {isFilterOpen && (
        <div className="p-4 bg-surface-dark rounded-xl border border-surface-border animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Filter by Tags
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() => setSelectedTags([])}
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={
                  selectedTags.includes(tag.tags) ? 'default' : 'secondary'
                }
                className={`cursor-pointer h-6 px-2 text-[10px] transition-all ${selectedTags.includes(tag.tags) ? 'bg-primary' : 'bg-surface-border text-gray-400 hover:text-white'}`}
                onClick={() => toggleTag(tag.tags)}
              >
                {tag.tags}
              </Badge>
            ))}
            {allTags.length === 0 && (
              <span className="text-xs text-gray-600 italic">
                No tags available
              </span>
            )}
          </div>
        </div>
      )}

      {/* Solutions List */}
      <div className="space-y-3">
        {filteredSolutions.map((sol) => (
          <div
            key={sol.id}
            className="group bg-surface-dark p-4 rounded-xl border border-surface-border hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onViewSolution(sol)}
          >
            <div className="flex gap-4">
              <Avatar className="size-10 rounded-lg border border-surface-border group-hover:border-primary/30 transition-colors">
                <AvatarImage
                  src={sol.author.profile_picture_url ?? undefined}
                />
                <AvatarFallback className="bg-surface-border text-gray-400">
                  <UserIcon size={20} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                    {sol.title}
                  </h4>
                  <span className="text-[10px] text-gray-600 shrink-0">
                    {formatInUserTimezone(sol.created_at, 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{sol.author.username}</span>
                  <span className="size-1 rounded-full bg-gray-700" />
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={12} /> {sol.upvote_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} /> {sol.comment_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {sol.views}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sol.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[10px] text-gray-500 bg-surface-border/50 px-1.5 py-0.5 rounded"
                    >
                      #{tag.tags}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-700 group-hover:text-primary transition-colors self-center shrink-0"
              />
            </div>
          </div>
        ))}

        {filteredSolutions.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-surface-dark/30 rounded-2xl border border-dashed border-surface-border">
            <div className="text-gray-500 italic">No solutions found</div>
            <p className="text-gray-600 text-xs">
              Be the first to share your approach!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
