// components/shared/Logo.tsx
import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'problem';
}

export function LogoIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Speed Trails Left */}
      <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cyan-400" />
      <path d="M3 8H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/60" />
      <path d="M2 16H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/60" />

      {/* Speed Trails Right */}
      <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cyan-400" />
      <path d="M19 16H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/60" />

      {/* Left Bracket < (Slanted Forward) */}
      <path 
        d="M10 6L5 12L8 18" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-white"
      />
      
      {/* Right Bracket > (Slanted Forward) */}
      <path 
        d="M16 6L21 12L14 18" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-white"
      />
      
      {/* Forward Slash / (Bold & Fast) */}
      <path 
        d="M15 3L9 21" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        className="text-primary"
      />
    </svg>
  );
}

export default function Logo({ variant = 'default' }: LogoProps) {
  const textColor = variant === 'problem' ? 'text-white' : 'text-slate-900 dark:text-white';

  return (
    <Link href="/" className="flex items-center gap-2 cursor-pointer group">
      <LogoIcon className="size-7 transition-transform group-hover:scale-110 duration-200" />
      <h2 className={`text-lg font-bold leading-tight tracking-[-0.015em] ${textColor}`}>
        CodeRacer
      </h2>
    </Link>
  );
}
