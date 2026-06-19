'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Problem,
  Tag,
  User,
  Solution,
  PaginatedResponse,
  Status,
} from '@/lib/models'
import { apiFetch, apiFetcher } from '@/lib/utils'
import useSWR from 'swr'
import { useAuth } from '@/components/auth-provider'
import Header from '@/components/header'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeMathjax from 'rehype-mathjax/svg'
import CodeBlock from '@/components/code-block'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  X,
  Maximize2,
  Minimize2,
  Eye,
  Code as CodeIcon,
  ChevronLeft,
  Loader2,
  Sparkles,
} from 'lucide-react'
import {
  LuHeading1,
  LuBold,
  LuItalic,
  LuList,
  LuListOrdered,
  LuMinus,
  LuFileCode,
  LuCode,
  LuImage,
  LuLink,
  LuQuote,
  LuSigma,
} from 'react-icons/lu'
import PageTransition from '@/components/page-transition'
import { Editor } from '@monaco-editor/react'

const DEFAULT_TEMPLATE = `# Intuition
<!-- Describe your first thoughts on how to solve this problem. -->

# Approach
<!-- Describe your approach to solving the problem. -->

# Complexity
- Time complexity:
<!-- Add your time complexity here, e.g. $$O(n)$$ -->

- Space complexity:
<!-- Add your space complexity here, e.g. $$O(n)$$ -->

# Code
`

export default function WriteSolutionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data: problem, isLoading: problemLoading } = useSWR<Problem>(
    `problems/${id}/`,
    apiFetcher
  )

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [isEditorial, setIsEditorial] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const [isEditorOnly, setIsEditorOnly] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showAISuccess, setShowAISuccess] = useState(false)
  const [aiCooldown, setAiCooldown] = useState(0)
  const [isDraftLoaded, setIsDraftLoaded] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const editorRef = useRef<any>(null)

  const DRAFT_KEY = `coderacer_solution_draft_${id}`

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      })
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      })
    }
  }

  // Cooldown timer logic
  useEffect(() => {
    if (aiCooldown > 0) {
      const timer = setTimeout(() => setAiCooldown(aiCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [aiCooldown])

  // Check if user has accepted solution
  const { data: userSolutions } = useSWR<any>(
    user ? `solutions/?problem_id=${id}&status=Accepted` : null,
    apiFetcher
  )

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const {
          title: savedTitle,
          body: savedBody,
          selectedTags: savedTags,
        } = JSON.parse(savedDraft)
        if (savedTitle) setTitle(savedTitle)
        if (savedBody) setBody(savedBody)
        if (savedTags) setSelectedTags(savedTags)
        setLastSaved(new Date())
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
    setIsDraftLoaded(true)
  }, [DRAFT_KEY])

  const saveDraft = (
    currentTitle: string,
    currentBody: string,
    currentTags: number[]
  ) => {
    const draft = JSON.stringify({
      title: currentTitle,
      body: currentBody,
      selectedTags: currentTags,
    })
    localStorage.setItem(DRAFT_KEY, draft)
    setLastSaved(new Date())
  }

  // Save draft to localStorage whenever content changes (only after initial load)
  useEffect(() => {
    if (isDraftLoaded) {
      const timer = setTimeout(() => {
        saveDraft(title, body, selectedTags)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [title, body, selectedTags, DRAFT_KEY, isDraftLoaded])

  // Autofill code if no body exists
  useEffect(() => {
    async function autofillCode() {
      if (userSolutions && body === '' && isDraftLoaded) {
        const results = Array.isArray(userSolutions)
          ? userSolutions
          : userSolutions?.results || []
        const acceptedSummary = results.find(
          (s: any) => s.status === 'Accepted' || s.status_display === 'Accepted'
        )

        let initialBody = DEFAULT_TEMPLATE
        if (acceptedSummary) {
          try {
            const response = await apiFetch(`solutions/${acceptedSummary.id}/`)
            if (response.ok) {
              const accepted = await response.json()
              const langMap: Record<string, string> = {
                CPP: 'cpp',
                PYTHON: 'python',
                JAVA: 'java',
                JAVASCRIPT: 'javascript',
                TYPESCRIPT: 'typescript',
              }
              const lang =
                langMap[accepted.language] ||
                accepted.language?.toLowerCase() ||
                ''
              initialBody += `\`\`\`${lang} []\n${accepted.code}\n\`\`\``
            }
          } catch (err) {
            console.error('Failed to fetch accepted code:', err)
          }
        }
        setBody(initialBody)
      }
    }
    autofillCode()
  }, [userSolutions, body, isDraftLoaded])

  const hasAcceptedSolution = useMemo(() => {
    if (!user) return false
    if (user.is_staff) return true
    const results = Array.isArray(userSolutions)
      ? userSolutions
      : userSolutions?.results || []
    return results.length > 0
  }, [user, userSolutions])

  if (authLoading || problemLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-dark">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (!hasAcceptedSolution && !user.is_staff && userSolutions !== undefined) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background-dark p-6 text-center space-y-4">
        <X size={64} className="text-red-500 opacity-50" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-gray-400 max-w-md">
          You must have at least one <strong>Accepted</strong> submission for
          this problem to write a solution.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  const handleGenerateAI = async () => {
    if (!problem || isGeneratingAI || aiCooldown > 0) return

    setIsGeneratingAI(true)
    try {
      const response = await apiFetch('ai/generate-explanation/', {
        method: 'POST',
        body: JSON.stringify({
          problem_description: problem.problem_description,
          current_text: body,
          code: body.match(/```(?:\w+)?\s*\[\]\n([\s\S]*?)\n```/)?.[1] || '',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newTitle = data.title || title
        const newBody = data.explanation || body

        setTitle(newTitle)
        setBody(newBody)

        // Force immediate save to localStorage for AI generated content
        const draft = JSON.stringify({
          title: newTitle,
          body: newBody,
          selectedTags,
        })
        localStorage.setItem(DRAFT_KEY, draft)
        setLastSaved(new Date())

        setShowAISuccess(true)
        setAiCooldown(60) // 1 minute cooldown
        setTimeout(() => setShowAISuccess(false), 2000)
        toast.success(`Generated using ${data.provider}`)
      } else if (response.status === 429) {
        toast.error('AI rate limit reached. Please try again later.')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to generate AI explanation')
      }
    } catch (err) {
      toast.error('An error occurred while generating.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please provide both a title and solution content.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiFetch('discussions/', {
        method: 'POST',
        body: JSON.stringify({
          problem: parseInt(id as string),
          title,
          body,
          tag_ids: selectedTags,
          is_editorial: isEditorial,
        }),
      })

      if (response.ok) {
        localStorage.removeItem(DRAFT_KEY)
        toast.success('Solution posted successfully!')
        router.push(`/problems/${id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to post solution')
      }
    } catch (err) {
      toast.error('An error occurred while posting.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!editorRef.current) return
    const editor = editorRef.current
    const selection = editor.getSelection()
    const model = editor.getModel()
    if (!selection || !model) return

    const selectedText = model.getValueInRange(selection)
    const replacement = prefix + selectedText + suffix

    editor.executeEdits('my-source', [
      {
        range: selection,
        text: replacement,
        forceMoveMarkers: true,
      },
    ])

    editor.focus()
    if (!selectedText) {
      const position = selection.getStartPosition()
      editor.setPosition({
        lineNumber: position.lineNumber,
        column: position.column + prefix.length,
      })
    }
  }

  const CustomAnimatedSparkles = ({ isThinking }: { isThinking: boolean }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative scale-110"
    >
      <motion.path
        d="M12 3L14.5 9L21 12L14.5 15L12 21L9.5 15L3 12L9.5 9L12 3Z"
        fill="currentColor"
        className="text-primary"
        animate={
          isThinking
            ? {
                scale: [1, 1.2, 0.9, 1.1, 1],
                rotate: [0, 90, 180, 270, 360],
                filter: [
                  'drop-shadow(0 0 2px var(--color-primary))',
                  'drop-shadow(0 0 8px var(--color-primary))',
                  'drop-shadow(0 0 2px var(--color-primary))',
                ],
              }
            : {
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }
        }
        transition={{
          duration: isThinking ? 2 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.path
        d="M6 6L7 8.5L8 6L7 3.5L6 6Z"
        fill="currentColor"
        className="text-primary/60"
        animate={{
          scale: [0.5, 1.2, 0.5],
          opacity: [0.3, 1, 0.3],
          y: isThinking ? [0, -4, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.2,
        }}
      />
      <motion.path
        d="M17 17L18.5 19.5L19 17L18.5 14.5L17 17Z"
        fill="currentColor"
        className="text-primary/60"
        animate={{
          scale: [0.5, 1.2, 0.5],
          opacity: [0.3, 1, 0.3],
          x: isThinking ? [0, 4, 0] : 0,
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          delay: 0.5,
        }}
      />
    </svg>
  )

  const AnimatedToolbarButton = ({
    onClick,
    title,
    children,
    animationType = 'scale',
  }: any) => {
    const variants = {
      scale: { hover: { scale: 1.2 } },
      tilt: { hover: { rotate: 10, scale: 1.1 } },
      slide: { hover: { x: 2, scale: 1.1 } },
      expand: { hover: { scale: 1.2, filter: 'brightness(1.5)' } },
      swing: {
        hover: {
          rotate: [0, -10, 10, 0],
          transition: { duration: 0.5, repeat: Infinity },
        },
      },
    }

    return (
      <motion.button
        onClick={onClick}
        title={title}
        whileHover="hover"
        whileTap={{ scale: 0.9 }}
        variants={(variants as any)[animationType]}
        className="rounded-md font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-white/5 text-gray-400 h-8 w-8 justify-center p-0 transition-colors"
      >
        {children}
      </motion.button>
    )
  }

  return (
    <PageTransition>
      <div className="h-screen flex flex-col bg-background-dark overflow-hidden">
        <Header variant="problem" />

        <div className="bg-surface-dark border-b border-surface-border p-3 space-y-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white gap-2"
            >
              <ChevronLeft size={16} />
              Back to Problem
            </Button>
            <div className="h-4 w-px bg-surface-border" />
            <Input
              placeholder="Solution Title (e.g., Simple O(N) Approach using Hash Map)"
              className="flex-1 bg-transparent border-none text-lg font-bold text-white focus-visible:ring-0 placeholder:text-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Draft Status */}
            <div className="flex items-center gap-4 shrink-0">
              {lastSaved && (
                <span className="text-[10px] text-gray-500 font-medium italic animate-in fade-in duration-300">
                  Draft saved{' '}
                  {lastSaved.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-400 hover:text-white border border-surface-border"
                onClick={() => saveDraft(title, body, selectedTags)}
              >
                Save Draft
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-6 h-9"
                onClick={handlePost}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Post Solution
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0">
                Tags:
              </span>
              {problem?.tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={
                    selectedTags.includes(tag.id) ? 'default' : 'secondary'
                  }
                  className={`cursor-pointer h-6 px-2 text-[10px] whitespace-nowrap ${selectedTags.includes(tag.id) ? 'bg-primary' : 'bg-surface-border text-gray-400'}`}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((tid) => tid !== tag.id)
                        : [...prev, tag.id]
                    )
                  }}
                >
                  {tag.tags}
                </Badge>
              ))}
            </div>
            {user?.is_staff && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <input
                  type="checkbox"
                  id="is-editorial"
                  checked={isEditorial}
                  onChange={(e) => setIsEditorial(e.target.checked)}
                  className="accent-yellow-500 h-3 w-3"
                />
                <label
                  htmlFor="is-editorial"
                  className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider cursor-pointer"
                >
                  Mark as Editorial
                </label>
              </div>
            )}
          </div>
        </div>

        <ResizablePanelGroup
          autoSaveId="coderacer-write-solution-layout"
          direction="horizontal"
          className="flex-1"
        >
          {!isPreviewOnly && (
            <ResizablePanel
              defaultSize={50}
              minSize={20}
              className="flex flex-col"
            >
              <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                <div className="flex h-12 items-center gap-1 shrink-0 px-3 border-b border-surface-border bg-surface-dark/50 overflow-x-auto no-scrollbar">
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('# ', '')}
                    title="Heading"
                    animationType="expand"
                  >
                    <LuHeading1 size={20} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('**', '**')}
                    title="Bold"
                    animationType="tilt"
                  >
                    <LuBold size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('*', '*')}
                    title="Italic"
                    animationType="tilt"
                  >
                    <LuItalic size={18} />
                  </AnimatedToolbarButton>

                  <div className="h-4 border-l border-surface-border mx-1 opacity-50"></div>

                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('- ', '')}
                    title="Bullet List"
                    animationType="slide"
                  >
                    <LuList size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('1. ', '')}
                    title="Numbered List"
                    animationType="slide"
                  >
                    <LuListOrdered size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('---\n', '')}
                    title="Separator"
                    animationType="scale"
                  >
                    <LuMinus size={18} />
                  </AnimatedToolbarButton>

                  <div className="h-4 border-l border-surface-border mx-1 opacity-50"></div>

                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('```\n', '\n```')}
                    title="Code Block"
                    animationType="expand"
                  >
                    <LuFileCode size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('`', '`')}
                    title="Inline Code"
                    animationType="expand"
                  >
                    <LuCode size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('![Image Description](', ')')}
                    title="Image"
                    animationType="expand"
                  >
                    <LuImage size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('[Link Title](', ')')}
                    title="Link"
                    animationType="expand"
                  >
                    <LuLink size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('> ', '')}
                    title="Blockquote"
                    animationType="swing"
                  >
                    <LuQuote size={18} />
                  </AnimatedToolbarButton>
                  <AnimatedToolbarButton
                    onClick={() => insertMarkdown('$', '$')}
                    title="Math (LaTeX)"
                    animationType="expand"
                  >
                    <LuSigma size={18} />
                  </AnimatedToolbarButton>

                  <div className="h-4 border-l border-surface-border mx-2 opacity-50"></div>

                  <motion.button
                    onClick={handleGenerateAI}
                    title="Generate explanation using AI"
                    disabled={isGeneratingAI || aiCooldown > 0}
                    whileHover={aiCooldown > 0 ? {} : 'hover'}
                    whileTap={aiCooldown > 0 ? {} : { scale: 0.96 }}
                    className={`relative rounded-lg font-medium items-center group whitespace-nowrap focus:outline-none inline-flex h-8 px-3 gap-2 overflow-hidden transition-all
                      ${isGeneratingAI || aiCooldown > 0 ? 'cursor-not-allowed bg-surface-dark/50 opacity-80' : 'bg-[#1e1e1e] border border-primary/20 hover:border-transparent shadow-lg shadow-primary/5'}`}
                  >
                    {!isGeneratingAI && (
                      <motion.div
                        variants={{ hover: { opacity: 1, rotate: [0, 360] } }}
                        transition={{
                          rotate: {
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                          },
                          opacity: { duration: 0.3 },
                        }}
                        className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,#3b82f6_90deg,#8b5cf6_180deg,#ec4899_270deg,transparent_360deg)] opacity-0 z-0"
                      />
                    )}
                    <div className="absolute inset-[1.5px] rounded-[7px] bg-[#1e1e1e] z-1" />
                    {isGeneratingAI && (
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 bg-linear-to-r from-transparent via-primary/20 to-transparent z-2"
                      />
                    )}
                    {!isGeneratingAI && (
                      <motion.div
                        variants={{ hover: { opacity: 1, scale: 1.1 } }}
                        className="absolute inset-0 rounded-lg opacity-0 blur-xl bg-primary/40 -z-10 transition-all duration-300"
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5">
                        <CustomAnimatedSparkles isThinking={isGeneratingAI} />
                      </div>
                      <div className="text-left">
                        <span
                          className={`text-sm leading-tight transition-all duration-200 ${isGeneratingAI ? 'text-primary' : 'group-hover:bg-linear-to-r group-hover:from-[#3b82f6] group-hover:via-purple-500 group-hover:to-pink-500 group-hover:bg-clip-text text-white group-hover:text-transparent '}`}
                        >
                          {isGeneratingAI
                            ? 'Thinking'
                            : aiCooldown > 0
                              ? `Wait ${aiCooldown}s`
                              : 'AI Explain'}
                        </span>
                      </div>
                    </div>
                    <AnimatePresence>
                      {showAISuccess && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.8, 1.8, 2.5],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6 }}
                          className="absolute inset-0 bg-green-500/30 rounded-lg pointer-events-none z-20"
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <div className="h-3 border-l border-surface-border mx-1"></div>
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    <button
                      className={`h-7 w-7 flex items-center justify-center rounded hover:bg-white/5 ${isEditorOnly ? 'text-primary bg-primary/10' : 'text-gray-500'}`}
                      onClick={() => {
                        setIsEditorOnly(!isEditorOnly)
                        setIsPreviewOnly(false)
                      }}
                      title="Editor Only"
                    >
                      <Minimize2 size={14} />
                    </button>
                    <button
                      className={`h-7 w-7 flex items-center justify-center rounded hover:bg-white/5 ${isPreviewOnly ? 'text-primary bg-primary/10' : 'text-gray-500'}`}
                      onClick={() => {
                        setIsPreviewOnly(!isPreviewOnly)
                        setIsEditorOnly(false)
                      }}
                      title="Preview Only"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 bg-[#1e1e1e] py-4">
                  <Editor
                    height="100%"
                    language="markdown"
                    value={body}
                    theme="vs-dark"
                    onChange={(value) => setBody(value ?? '')}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'off',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>
          )}

          {!isEditorOnly && !isPreviewOnly && (
            <ResizableHandle withHandle className="bg-surface-border" />
          )}

          {!isEditorOnly && (
            <ResizablePanel
              defaultSize={50}
              minSize={20}
              className="flex flex-col"
            >
              <div className="flex-1 bg-background-dark p-6 overflow-y-auto">
                <div className="prose prose-invert max-w-none prose-sm prose-code:before:content-none prose-code:after:content-none border-t border-surface-border pt-6">
                  {body ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeRaw, rehypeMathjax]}
                      components={{
                        pre: ({ children }) => <>{children}</>,
                        code({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }: any) {
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
                      {body}
                    </ReactMarkdown>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-2 opacity-50">
                      <Eye size={48} />
                      <p className="text-sm font-bold uppercase tracking-widest">
                        Preview will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </PageTransition>
  )
}
