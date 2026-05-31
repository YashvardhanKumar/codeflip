"use client";
import Header from '@/components/header';
import ProblemDescription from '@/components/problem/problem-description';
import CodeEditor from '@/components/problem/code-editor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { DescriptionSkeleton, EditorSkeleton } from '@/components/loader';
import PageTransition from '@/components/page-transition';
import { useAuth } from '@/components/auth-provider';
import { apiFetcher } from '@/lib/utils';
import { Problem } from '@/lib/models';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { data, error, isLoading: problemLoading } = useSWR<Problem>("problems/" + id + "/", apiFetcher)

  const isLoading = problemLoading || authLoading;

  if (error && !isLoading) {
    return <div className='h-screen flex items-center justify-center text-white bg-background-dark text-sm font-mono tracking-wider uppercase opacity-50'>Error loading problem.</div>
  }

  // if (!data && !isLoading) {
  //   return <div className='h-screen flex items-center justify-center text-white bg-background-dark text-sm font-mono tracking-wider uppercase opacity-50'>Problem not found.</div>
  // }

  return (
    <PageTransition>
      <div className='h-screen flex flex-col overflow-hidden bg-background-dark'>
        <Header variant='problem' />

        <ResizablePanelGroup direction='horizontal'>
          {isLoading ? (
            <ResizablePanel defaultSize={50} minSize={20}>
              <DescriptionSkeleton />
            </ResizablePanel>
          ) : (
            <ProblemDescription problem={data!} />
          )}
          
          <ResizableHandle withHandle />
          
          {isLoading ? (
            <ResizablePanel defaultSize={50} minSize={20}>
              <EditorSkeleton />
            </ResizablePanel>
          ) : (
            <CodeEditor user={user} problem={data!} />
          )}
        </ResizablePanelGroup>
      </div>
    </PageTransition>
  );
}