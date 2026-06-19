'use client'
import { useState, useEffect } from 'react'
import { Discuss, Comment, User } from '@/lib/models'
import { apiFetch, formatInUserTimezone } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import Link from 'next/link'
import CodeBlock from '../code-block'
import {
  X,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  MoreVertical,
  User as UserIcon,
  Reply,
  Send,
  Loader2,
  Eye,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Input } from '../ui/input'

interface Props {
  solution: Discuss
  onClose: () => void
  currentUser: User | null
}

export default function SolutionDetail({
  solution: initialSolution,
  onClose,
  currentUser,
}: Props) {
  const [solution, setSolution] = useState<Discuss>(initialSolution)
  const [comments, setComments] = useState<Comment[]>([])
  const [isVoting, setIsVoting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  useEffect(() => {
    // Fetch fresh detail with comments and views incremented
    async function fetchDetail() {
      try {
        const response = await apiFetch(`discussions/${initialSolution.id}/`)
        const data = await response.json()
        setSolution(data)
        if (data.comments) setComments(data.comments)
      } catch (err) {
        console.error('Error fetching solution detail:', err)
      }
    }
    fetchDetail()
  }, [initialSolution.id])

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUser) {
      toast.error('Please sign in to vote')
      return
    }
    setIsVoting(true)
    try {
      const response = await apiFetch(
        `discussions/${solution.id}/${type}vote/`,
        {
          method: 'POST',
        }
      )
      if (response.ok) {
        // Refresh detail to get new counts
        const detailRes = await apiFetch(`discussions/${solution.id}/`)
        const data = await detailRes.json()
        setSolution(data)
      }
    } catch (err) {
      toast.error('Failed to vote')
    } finally {
      setIsVoting(false)
    }
  }

  const handleSubmitComment = async (parentId: number | null = null) => {
    if (!currentUser) {
      toast.error('Please sign in to comment')
      return
    }
    const body = parentId
      ? (document.getElementById(`reply-input-${parentId}`) as HTMLInputElement)
          ?.value
      : newComment
    if (!body?.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await apiFetch(
        `discussions/${solution.id}/add_comment/`,
        {
          method: 'POST',
          body: JSON.stringify({ body, parent_id: parentId }),
        }
      )
      if (response.ok) {
        const commentData = await response.json()
        if (parentId) {
          // Find parent and add to its replies
          setComments((prev) =>
            prev.map((c) => {
              if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), commentData] }
              }
              return c
            })
          )
          setReplyingTo(null)
        } else {
          setComments((prev) => [commentData, ...prev])
          setNewComment('')
        }
        toast.success('Comment added')
      }
    } catch (err) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 bg-background-dark z-[70] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="h-12 border-b border-surface-border flex items-center justify-between px-4 bg-surface-dark shrink-0">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary text-[10px] uppercase font-bold"
          >
            Solution
          </Badge>
          <h2 className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">
            {solution.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
          {/* Author Header */}
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="size-12 rounded-xl border border-surface-border">
                <AvatarImage
                  src={solution.author.profile_picture_url ?? undefined}
                />
                <AvatarFallback className="bg-surface-border text-gray-400">
                  <UserIcon size={24} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-white">
                  {solution.author.username}
                </h3>
                <p className="text-xs text-gray-500">
                  Posted on{' '}
                  {formatInUserTimezone(solution.created_at, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500"
              >
                <Share2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500"
              >
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none prose-sm prose-headings:text-white prose-p:text-gray-300 prose-code:before:content-none prose-code:after:content-none bg-surface-dark/30 p-6 rounded-2xl border border-surface-border">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
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
                p: ({ children }) => {
                  // Basic @mention highlighting (mock, clicking opens profile)
                  const content = Array.isArray(children)
                    ? children
                    : [children]
                  return (
                    <p>
                      {content.map((child, i) => {
                        if (typeof child === 'string' && child.includes('@')) {
                          return child.split(/(@\w+)/).map((part, j) =>
                            part.startsWith('@') ? (
                              <Link
                                key={j}
                                href={`/profile/${part.slice(1)}`}
                                className="text-primary hover:underline"
                              >
                                {part}
                              </Link>
                            ) : (
                              part
                            )
                          )
                        }
                        return child
                      })}
                    </p>
                  )
                },
              }}
            >
              {solution.body}
            </ReactMarkdown>
          </div>

          {/* Voting & Stats */}
          <div className="flex items-center gap-6 border-t border-b border-surface-border py-4">
            <div className="flex items-center gap-1 bg-surface-dark rounded-lg border border-surface-border p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-2 ${solution.has_upvoted ? 'text-primary bg-primary/10' : 'text-gray-500'}`}
                onClick={() => handleVote('up')}
                disabled={isVoting}
              >
                <ThumbsUp size={16} />
                <span className="text-xs font-bold">
                  {solution.upvote_count}
                </span>
              </Button>
              <div className="w-px h-4 bg-surface-border" />
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-2 ${solution.has_downvoted ? 'text-red-500 bg-red-500/10' : 'text-gray-500'}`}
                onClick={() => handleVote('down')}
                disabled={isVoting}
              >
                <ThumbsDown size={16} />
                <span className="text-xs font-bold">
                  {solution.downvote_count}
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Eye size={16} />
              <span>{solution.views} Views</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Comments ({solution.comment_count})
            </h3>

            {/* Post Comment */}
            <div className="flex gap-4">
              <Avatar className="size-8 rounded-lg border border-surface-border shrink-0">
                <AvatarImage
                  src={currentUser?.profile_picture_url ?? undefined}
                />
                <AvatarFallback className="bg-surface-border text-gray-400">
                  <UserIcon size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <textarea
                  placeholder="Write a comment..."
                  className="w-full bg-surface-dark border border-surface-border rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-primary min-h-[80px] resize-none"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 gap-2"
                    onClick={() => handleSubmitComment()}
                    disabled={isSubmittingComment || !newComment.trim()}
                  >
                    {isSubmittingComment ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6 pt-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={() => setReplyingTo(comment.id)}
                  isReplying={replyingTo === comment.id}
                  onCancelReply={() => setReplyingTo(null)}
                  onSubmitReply={() => handleSubmitComment(comment.id)}
                  isSubmitting={isSubmittingComment}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CommentItem({
  comment,
  onReply,
  isReplying,
  onCancelReply,
  onSubmitReply,
  isSubmitting,
}: {
  comment: Comment
  onReply: () => void
  isReplying: boolean
  onCancelReply: () => void
  onSubmitReply: () => void
  isSubmitting: boolean
}) {
  return (
    <div className="group space-y-4">
      <div className="flex gap-4">
        <Avatar className="size-8 rounded-lg border border-surface-border shrink-0">
          <AvatarImage src={comment.author.profile_picture_url ?? undefined} />
          <AvatarFallback className="bg-surface-border text-gray-400">
            <UserIcon size={16} />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {comment.author.username}
            </span>
            <span className="text-[10px] text-gray-600">
              {formatInUserTimezone(comment.created_at, 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {comment.body}
          </p>
          <div className="flex items-center gap-4 pt-1">
            <button
              className="text-[10px] font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
              onClick={onReply}
            >
              <Reply size={12} /> Reply
            </button>
            <div className="flex items-center gap-3">
              <button className="text-[10px] font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                <ThumbsUp size={12} /> {comment.upvote_count}
              </button>
              <button className="text-[10px] font-bold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
                <ThumbsDown size={12} /> {comment.downvote_count}
              </button>
            </div>
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3"
              >
                <div className="flex flex-col gap-2">
                  <textarea
                    id={`reply-input-${comment.id}`}
                    placeholder={`Reply to @${comment.author.username}...`}
                    className="w-full bg-surface-dark border border-surface-border rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-primary min-h-[60px] resize-none"
                    defaultValue={`@${comment.author.username} `}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={onCancelReply}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-[10px] bg-primary hover:bg-primary/90"
                      onClick={onSubmitReply}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 size={10} className="animate-spin mr-1" />
                      )}
                      Post Reply
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-12 space-y-4 border-l border-surface-border/50">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              isReplying={false}
              onCancelReply={() => {}}
              onSubmitReply={() => {}}
              isSubmitting={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
