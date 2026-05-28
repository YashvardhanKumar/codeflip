// components/problem/ProblemHeader.tsx
import Link from 'next/link';
import Logo from '@/components/logo';
import IconButton from '@/components/icon-button';
import { useAuth } from '@/components/auth-provider';

export default function ProblemHeader() {
  const { user } = useAuth();

  return (
    <header className="h-12.5 shrink-0 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-surface-border bg-surface-dark px-4">
      <div className="flex items-center gap-3">
        <Logo variant="problem" />
        
        <div className="h-4 w-px bg-gray-600 hidden md:block" />
        
        <div className="flex items-center gap-4">
          <Link href="/problems" className="flex items-center gap-1 text-gray-300 hover:text-white text-sm font-medium">
            <span className="material-symbols-outlined text-lg">list</span>
            Problem List
          </Link>
          
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <IconButton icon="chevron_left" title="Previous Problem" />
            <IconButton icon="chevron_right" title="Next Problem" />
            <IconButton icon="shuffle" title="Random Problem" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-surface-border hover:bg-muted text-gray-300 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-base text-yellow-500">bug_report</span>
          Debug
        </button>
        
        <button className="flex items-center justify-center overflow-hidden rounded-md bg-primary/20 hover:bg-primary/30 transition-colors h-8 px-3 text-primary text-xs font-bold">
          Premium
        </button>
        
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full" />
          </button>
          
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-7 cursor-pointer border border-gray-600 flex items-center justify-center bg-slate-700 overflow-hidden"
            style={user?.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
            title={user?.name || user?.username || "Guest"}
          >
            {!user?.avatar && (
               <span className="text-[10px] font-bold text-white uppercase">
                 {(user?.name || user?.username || "G").substring(0, 1)}
               </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
