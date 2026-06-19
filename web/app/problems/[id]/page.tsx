'use client'
import Header from '@/components/header'
import ProblemDescription from '@/components/problem/problem-description'
import CodeEditor from '@/components/problem/code-editor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { useState, useRef } from 'react'
import { ImperativePanelHandle } from 'react-resizable-panels'
import { DescriptionSkeleton, EditorSkeleton } from '@/components/loader'
import PageTransition from '@/components/page-transition'
import { useAuth } from '@/components/auth-provider'
import { apiFetcher } from '@/lib/utils'
import { Problem } from '@/lib/models'

export default function ProblemDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [maximizedSide, setMaximizedSide] = useState<'left' | 'right' | null>(
    null
  )
  const leftPanelRef = useRef<ImperativePanelHandle>(null)
  const rightPanelRef = useRef<ImperativePanelHandle>(null)

  const {
    data,
    error,
    isLoading: problemLoading,
  } = useSWR<Problem>('problems/' + id + '/', apiFetcher)

  const isLoading = problemLoading || authLoading

  const handleMaximizeLeft = () => {
    if (leftPanelRef.current && rightPanelRef.current) {
      rightPanelRef.current.collapse()
      leftPanelRef.current.resize(100)
      setMaximizedSide('left')
    }
  }

  const handleMaximizeRight = () => {
    if (leftPanelRef.current && rightPanelRef.current) {
      leftPanelRef.current.collapse()
      rightPanelRef.current.resize(100)
      setMaximizedSide('right')
    }
  }

  const handleRestore = () => {
    if (leftPanelRef.current && rightPanelRef.current) {
      try {
        const saved = localStorage.getItem(
          'react-resizable-panels:coderacer-horizontal-layout'
        )
        if (saved) {
          const sizes = JSON.parse(saved)
          if (Array.isArray(sizes) && sizes.length === 2) {
            leftPanelRef.current.expand()
            rightPanelRef.current.expand()
            leftPanelRef.current.resize(sizes[0])
            rightPanelRef.current.resize(sizes[1])
            setMaximizedSide(null)
            return
          }
        }
      } catch (e) {
        console.error('Error restoring layout:', e)
      }

      leftPanelRef.current.expand()
      rightPanelRef.current.expand()
      leftPanelRef.current.resize(50)
      rightPanelRef.current.resize(50)
      setMaximizedSide(null)
    }
  }

  if (error && !isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-background-dark text-sm font-mono tracking-wider uppercase opacity-50">
        Error loading problem.
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="h-screen flex flex-col overflow-hidden bg-background-dark">
        <Header variant="problem" />

        <ResizablePanelGroup
          autoSaveId="coderacer-horizontal-layout"
          direction="horizontal"
        >
          {isLoading ? (
            <ResizablePanel defaultSize={50} minSize={20}>
              <DescriptionSkeleton />
            </ResizablePanel>
          ) : (
            <ProblemDescription
              ref={leftPanelRef}
              problem={data!}
              maximizedSide={maximizedSide}
              onMaximize={handleMaximizeLeft}
              onRestore={handleRestore}
            />
          )}

          <ResizableHandle withHandle />

          {isLoading ? (
            <ResizablePanel defaultSize={50} minSize={20}>
              <EditorSkeleton />
            </ResizablePanel>
          ) : (
            <CodeEditor
              ref={rightPanelRef}
              user={user}
              problem={data!}
              maximizedSide={maximizedSide}
              onMaximize={handleMaximizeRight}
              onRestore={handleRestore}
            />
          )}
        </ResizablePanelGroup>
      </div>
    </PageTransition>
  )
}
