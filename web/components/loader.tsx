import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export function Loader({ className }: LoaderProps) {
  return (
    <div className={cn("w-full h-full min-h-[100px] flex flex-col gap-6 p-6", className)}>
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
      <Skeleton className="flex-1 w-full rounded-xl min-h-[200px]" />
    </div>
  );
}

export function LoaderSmall({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizes = {
    sm: 'h-4 w-24',
    md: 'h-5 w-32',
    lg: 'h-6 w-48'
  };

  return (
    <Skeleton className={cn(sizes[size], "rounded-md", className)} />
  );
}

export function SubmissionSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Skeleton className="h-7 w-40 mb-6 rounded-md" />
      <div className="w-full overflow-hidden rounded-xl border border-surface-border">
        <div className="bg-surface-dark/50 h-10 flex items-center px-4 gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="divide-y divide-surface-border bg-background-dark">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DescriptionSkeleton() {
  return (
    <div className="h-full flex flex-col bg-surface-dark animate-in fade-in duration-500">
      <div className="flex items-center gap-1 bg-[#282e39] p-1 h-10 border-b border-surface-border">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>
      <div className="flex-1 p-6 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="h-10 bg-surface-dark border-t border-surface-border flex items-center justify-between px-4">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="h-full flex flex-col bg-editor-bg animate-in fade-in duration-500">
      <div className="h-10 border-b border-surface-border flex items-center justify-between px-4 bg-black/20">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
      <div className="flex-1 p-4 font-mono">
        <div className="space-y-3">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className={cn("h-4 rounded", i % 3 === 0 ? 'w-1/2' : i % 2 === 0 ? 'w-3/4' : 'w-2/3')} />
            </div>
          ))}
        </div>
      </div>
      <div className="h-1/3 border-t border-surface-border bg-surface-dark">
        <div className="flex items-center px-4 py-2 gap-4 border-b border-surface-border bg-black/20">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-surface-border">
        <div className="bg-slate-50 dark:bg-surface-dark h-12 flex items-center px-6 border-b border-slate-200 dark:border-surface-border">
          <Skeleton className="h-4 w-12 mr-8" />
          <Skeleton className="h-4 w-48 mr-auto" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-surface-border">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-5 flex items-center">
              <Skeleton className="h-4 w-8 mr-12 rounded" />
              <Skeleton className="h-4 w-64 mr-auto rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-4 w-40 mr-auto" />
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}
