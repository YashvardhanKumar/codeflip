import { LogoIcon } from "./logo";

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark overflow-hidden relative">

      <div className="relative flex flex-col items-center z-20">
        {/* Main Logo Container */}
        <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
          {/* Pulsing Hexagon/Orb Background */}
          <div className="absolute inset-0 bg-primary/10 blur-3xl animate-pulse-glow rounded-full" />
          
          {/* Outer Spin Ring (Segmented) */}
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin [animation-duration:1s]" />
          
          {/* Middle Spin Ring (Dashed) */}
          <div className="absolute inset-4 border border-dashed border-cyan-400/30 rounded-full animate-spin [animation-direction:reverse] [animation-duration:3s]" />
          
          {/* Logo with Inner Glow */}
          <div className="relative drop-shadow-[0_0_15px_rgba(43,108,238,0.6)]">
            <LogoIcon className="size-14 animate-in fade-in zoom-in duration-500" />
          </div>

          {/* Speed HUD Elements */}
        </div>

        {/* Text Animation */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <span className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Code<span className="text-primary">Racer</span>
            </span>
            {/* Reflective shine effect */}
          </div>
          
          {/* Enhanced Progress Container */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-64 h-1.5 bg-surface-dark border border-surface-border rounded-full overflow-hidden relative shadow-inner">
              {/* Dynamic Loading Bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-400 to-primary w-1/3 rounded-full animate-loading-bar" />
              {/* Glint on bar */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-20 animate-[move-right_2s_infinite]" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-block size-1 bg-primary rounded-full animate-ping" />
              <p className="">
                <span className="text-xs text-text-secondary font-mono tracking-[0.2em] uppercase opacity-70 text-white animate-pulse">Loading</span>
              </p>
              <span className="inline-block size-1 bg-primary rounded-full animate-ping" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Corner HUD elements */}
      <div className="absolute top-8 left-8 border-l border-t border-primary/30 size-12 opacity-50" />
      <div className="absolute bottom-8 right-8 border-r border-b border-primary/30 size-12 opacity-50" />
    </div>
  );
}

export function LoaderSmall({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizes[size]}`}>
      <div className="absolute inset-0 border-2 border-surface-border rounded-full opacity-20" />
      <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin drop-shadow-[0_0_5px_rgba(43,108,238,0.5)]" />
    </div>
  );
}
