// components/shared/IconButton.tsx
'use client';

interface IconButtonProps {
  icon: string;
  onClick?: () => void;
  title?: string;
  variant?: 'default' | 'toolbar';
  size?: 'sm' | 'md';
  className?: string;
}

export default function IconButton({ 
  icon, 
  onClick, 
  title,
  variant = 'default',
  size = 'md',
  className = ''
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5'
  };
  
  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg'
  };
  
  const variantClasses = {
    default: 'hover:bg-gray-700 text-gray-400 hover:text-white',
    toolbar: 'hover:bg-surface-border text-gray-400 hover:text-white'
  };
  
  return (
    <button
      onClick={onClick}
      title={title}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded transition-colors ${className}`}
    >
      <span className={`material-symbols-outlined ${iconSizes[size]}`}>
        {icon}
      </span>
    </button>
  );
}