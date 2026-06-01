'use client'

// Profile page for displaying user statistics and activity.
import Header from '@/components/header'
import PageTransition from '@/components/page-transition'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetcher, formatInUserTimezone } from '@/lib/utils'
import apiClient from '@/lib/utils'
import {
  Difficulty,
  HeatmapDay,
  Language,
  LanguageDisplayNames,
  ProfileProblemSummary,
  ProfileSubmission,
  Status,
  UserProfile,
} from '@/lib/models'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'

const difficultyColors: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'text-green-500 bg-green-500/10',
  [Difficulty.MEDIUM]: 'text-yellow-500 bg-yellow-500/10',
  [Difficulty.HARD]: 'text-red-500 bg-red-500/10',
}

const heatLevels = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-emerald-200 dark:bg-emerald-900',
  'bg-emerald-300 dark:bg-emerald-700',
  'bg-emerald-500 dark:bg-emerald-500',
  'bg-emerald-700 dark:bg-emerald-300',
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )

  const { data, error, isLoading } = useSWR<UserProfile>(
    user ? `auth/users/profile/?year=${selectedYear}` : null,
    apiFetcher
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [defaultLang, setDefaultLang] = useState<Language>(Language.PYTHON)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, router, user])

  useEffect(() => {
    if (!data?.user) return
    setName(data.user.name ?? '')
    setEmail(data.user.email ?? '')
    setDefaultLang(data.user.default_lang ?? Language.PYTHON)
  }, [data?.user])

  const avatarUrl =
    data?.user.profile_picture_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${data?.user.username || 'codeflip'}`
  const displayName = data?.user.name || data?.user.username || 'CodeFlip'
  const statuses = data
    ? Object.entries(data.stats.status_breakdown).filter(
        ([, count]) => count > 0
      )
    : []
  const saveProfile = async () => {
    setIsSaving(true)
    try {
      await apiClient.patch('auth/users/update_profile/', {
        name,
        email,
        default_lang: defaultLang,
      })
      await Promise.all([mutate('auth/users/profile/'), refreshUser()])
      toast.success('Profile updated')
    } catch {
      toast.error('Could not update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const uploadProfilePicture = async (file?: File) => {
    if (!file) return
    const formData = new FormData()
    formData.append('profile_picture', file)

    try {
      await apiClient.patch('auth/users/update_profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await Promise.all([mutate('auth/users/profile/'), refreshUser()])
      toast.success('Profile picture updated')
    } catch {
      toast.error('Could not upload profile picture')
    }
  }

  const showLoading = loading || isLoading

  if (error && !showLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Header />
        <main className="mx-auto max-w-350 p-8 text-red-500">
          Failed to load profile.
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <PageTransition>
        <main className="mx-auto flex max-w-350 flex-col gap-6 p-4 md:p-8">
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-border dark:bg-surface-dark">
              {showLoading ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="size-28 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-md" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-28 border border-slate-200 dark:border-surface-border">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                      {data?.user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor="profile-picture"
                    className="mt-4 cursor-pointer rounded-md bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90"
                  >
                    Change Photo
                  </Label>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      uploadProfilePicture(event.target.files?.[0])
                    }
                  />
                  <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                    {displayName}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-text-secondary">
                    @{data?.user.username}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-text-secondary">
                    Joined{' '}
                    {formatInUserTimezone(
                      data?.user.date_joined || '',
                      'MMM d, yyyy'
                    )}
                  </p>
                </div>
              )}

              {!showLoading && (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <StatTile
                      label="Solved"
                      value={data?.stats.unique_problems_solved || 0}
                    />
                    <StatTile
                      label="Attempts"
                      value={data?.stats.total_submissions || 0}
                    />
                    <StatTile
                      label="Streak"
                      value={`${data?.stats.current_streak || 0}d`}
                    />
                    <StatTile
                      label="Active Days"
                      value={data?.stats.active_days || 0}
                    />
                  </div>
                  <div className="mt-6">
                    {statuses.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-text-secondary">
                        No submission statuses yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {statuses.slice(0, 2).map(([status, count]) => (
                          <div
                            key={status}
                            className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-background-dark"
                          >
                            <span className="text-sm text-slate-600 dark:text-text-secondary">
                              {status}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 space-y-3">
                    <ProfileField
                      label="Name"
                      value={name}
                      onChange={setName}
                    />
                    <ProfileField
                      label="Email"
                      value={email}
                      onChange={setEmail}
                    />
                    <div className="space-y-1.5">
                      <Label>Default language</Label>
                      <select
                        value={defaultLang}
                        onChange={(event) =>
                          setDefaultLang(event.target.value as Language)
                        }
                        className="h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm dark:border-surface-border"
                      >
                        {Object.values(Language).map((language) => (
                          <option key={language} value={language}>
                            {LanguageDisplayNames[language]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="w-full bg-primary text-white hover:bg-primary/90"
                    >
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-border dark:bg-surface-dark">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Progress
                    </h2>
                    <div className="text-sm text-slate-500 dark:text-text-secondary">
                      {showLoading ? (
                        <Skeleton className="h-4 w-36" />
                      ) : (
                        `${data?.stats.success_rate || 0}% accepted across ${data?.stats.total_submissions || 0} submissions`
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-text-secondary">
                    {showLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      `${data?.stats.unique_problems_attempted || 0} problems attempted`
                    )}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {Object.values(Difficulty).map((difficulty) => (
                    <DifficultyProgress
                      key={difficulty}
                      difficulty={difficulty}
                      data={data}
                      isLoading={showLoading}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-border dark:bg-surface-dark">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Submission Heatmap
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-text-secondary">
                      Coding activity for{' '}
                      {showLoading ? '...' : data?.selected_year}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="h-8 rounded-md border border-slate-200 bg-transparent px-2 text-xs font-medium dark:border-surface-border"
                    >
                      {showLoading ? (
                        <option>...</option>
                      ) : (
                        data?.available_years?.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="text-xs text-slate-500 dark:text-text-secondary">
                      {showLoading ? (
                        <Skeleton className="h-4 w-16" />
                      ) : (
                        `${data?.stats?.active_days || 0} active days`
                      )}
                    </span>
                  </div>
                </div>
                {showLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <Heatmap days={data?.heatmap || []} />
                )}
              </section>
              <section className="grid gap-6 xl:grid-cols-2">
                <ActivityList
                  title="Recent Submissions"
                  submissions={data?.recent_submissions}
                  isLoading={showLoading}
                />
                <ProblemList
                  title="Solved Problems"
                  problems={data?.solved_problems}
                  empty="No accepted solutions yet."
                  isLoading={showLoading}
                />
                <ProblemList
                  title="Attempted Problems"
                  problems={data?.attempted_problems}
                  empty="No attempted-only problems yet."
                  isLoading={showLoading}
                />
              </section>
            </div>
          </section>
        </main>
      </PageTransition>
    </div>
  )
}

function ProfileField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3 dark:bg-background-dark">
      <div className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-text-secondary">
        {label}
      </div>
    </div>
  )
}

function DifficultyProgress({
  difficulty,
  data,
  isLoading,
}: {
  difficulty: Difficulty
  data: UserProfile | undefined
  isLoading: boolean
}) {
  if (isLoading || !data) return <Skeleton className="h-24 w-full rounded-md" />

  const stats = data.stats.difficulty_breakdown[difficulty]
  const attempted = Math.max(stats.attempted, stats.solved)
  const percentage =
    attempted === 0 ? 0 : Math.round((stats.solved / attempted) * 100)

  return (
    <div className="rounded-md bg-slate-50 p-4 dark:bg-background-dark">
      <div className="flex items-center justify-between">
        <span
          className={`rounded px-2 py-1 text-xs font-bold ${difficultyColors[difficulty]}`}
        >
          {difficulty}
        </span>
        <span className="text-sm font-semibold">
          {stats.solved}/{attempted}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function Heatmap({ days }: { days: HeatmapDay[] }) {
  const months = useMemo(() => {
    const grouped: Record<string, HeatmapDay[]> = {}
    days.forEach((day) => {
      const monthKey = format(parseISO(day.date), 'MMM')
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(day)
    })
    return Object.entries(grouped)
  }, [days])

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-6">
        {months.map(([month, monthDays]) => {
          const weeks: HeatmapDay[][] = []
          for (let i = 0; i < monthDays.length; i += 7) {
            weeks.push(monthDays.slice(i, i + 7))
          }

          return (
            <div key={month} className="flex flex-col gap-2">
              <span className="text-[10px] font-medium text-slate-400 dark:text-text-secondary uppercase tracking-wider">
                {month}
              </span>
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-1">
                    {week.map((day) => {
                      const level = Math.min(day.count, heatLevels.length - 1)
                      return (
                        <div
                          key={day.date}
                          title={`${day.date}: ${day.count} submissions`}
                          className={`size-3 rounded-xs ${heatLevels[level]} transition-colors hover:ring-1 hover:ring-primary/50`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
        <span>Less</span>
        {heatLevels.map((level, i) => (
          <div key={i} className={`size-3 rounded-xs ${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

function ActivityList({
  title,
  submissions,
  isLoading,
}: {
  title: string
  submissions: ProfileSubmission[] | undefined
  isLoading: boolean
}) {
  return (
    <section className="rounded-lg border border-slate-200 col-span-2 bg-white p-6 shadow-sm dark:border-surface-border dark:bg-surface-dark h-96 flex flex-col relative">
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="space-y-3 overflow-y-auto flex-1 min-h-0 relative pr-1">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))
        ) : !submissions || submissions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-text-secondary">
            No submissions yet.
          </p>
        ) : (
          submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/problems/${submission.problem_id}`}
              className="flex items-center justify-between gap-4 rounded-md bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-background-dark dark:hover:bg-slate-800"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900 dark:text-white">
                  {submission.problem_name}
                </div>
                <div className="text-xs text-slate-500 dark:text-text-secondary">
                  {submission.language_display} |{' '}
                  {formatInUserTimezone(submission.created_at, 'MMM d, HH:mm')}
                </div>
              </div>
              <span
                className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${submission.status === Status.SUCCESS ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
              >
                {submission.status_display}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function ProblemList({
  title,
  problems,
  empty,
  isLoading,
}: {
  title: string
  problems: ProfileProblemSummary[] | undefined
  empty: string
  isLoading: boolean
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-surface-border dark:bg-surface-dark h-96 flex flex-col relative">
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="space-y-2 overflow-y-auto flex-1 min-h-0 relative pr-1">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))
        ) : !problems || problems.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-text-secondary">
            {empty}
          </p>
        ) : (
          problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className="flex items-center justify-between rounded-md bg-slate-50 p-3 hover:bg-slate-100 dark:bg-background-dark dark:hover:bg-slate-800"
            >
              <span className="font-medium text-slate-900 dark:text-white">
                {problem.id}. {problem.name}
              </span>
              <span
                className={`rounded px-2 py-1 text-xs font-bold ${difficultyColors[problem.difficulty]}`}
              >
                {problem.difficulty}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
