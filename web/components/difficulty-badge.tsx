// components/shared/DifficultyBadge.tsx
interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const styles = {
    EASY: 'bg-emerald-500/10 text-emerald-400',
    MEDIUM: 'bg-yellow-500/10 text-yellow-400',
    HARD: 'bg-red-500/10 text-red-400',
  }

  return (
    <span
      className={`px-2 py-1 rounded-full ${styles[difficulty]} text-xs font-medium`}
    >
      {difficulty}
    </span>
  )
}
