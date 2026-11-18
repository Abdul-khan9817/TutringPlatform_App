import { DashboardIcon } from '@/components/ui/dashboard-icon'
import { getSession } from '@/lib/auth'
import { getStudentProgressFromDatabase } from '@/lib/dashboard-data'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const LEVEL_CONFIG: Record<string, { badge: string; border: string; accent: string; description: string }> = {
  A1: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: 'border-emerald-300',
    accent: 'bg-emerald-500',
    description: 'Basic everyday expressions, introductions, and essential survival phrases in Portugal.',
  },
  A2: {
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    border: 'border-teal-300',
    accent: 'bg-teal-500',
    description: 'Workplace interactions, shopping, directions, and routine administrative conversations.',
  },
  B1: {
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    border: 'border-blue-300',
    accent: 'bg-blue-500',
    description: 'Independent communication on work, study, travel, and personal experiences. CIPLE exam level.',
  },
  B2: {
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    border: 'border-indigo-300',
    accent: 'bg-indigo-500',
    description: 'Professional fluency, spontaneous conversations, technical workplace reports and meetings.',
  },
  C1: {
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
    border: 'border-purple-300',
    accent: 'bg-purple-500',
    description: 'Advanced professional and academic fluency, nuanced tone, complex presentations and negotiations.',
  },
  C2: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    border: 'border-rose-300',
    accent: 'bg-rose-500',
    description: 'Mastery of nuanced idiomatic Portuguese for high-level governance, literature and leadership.',
  },
}

export default async function StudentProgressPage() {
  const session = await getSession()
  if (!session) return null

  const progress = await getStudentProgressFromDatabase(session.sub)
  const current = progress.find((p) => p.current)
  const totalCompleted = progress.reduce((sum, p) => sum + p.completedLessons, 0)
  const totalTarget = progress.reduce((sum, p) => sum + p.targetLessons, 0)
  const completedLevelsCount = progress.filter((p) => p.achievedAt).length

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full">
              Learning progress
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Learning Progress
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your current CEFR level and completed lessons.
          </p>
        </div>

        <Link
          href="/student/bookings"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm shadow-sm transition-all hover:-translate-y-0.5"
        >
          <span>Schedule Next Lesson</span>
          <span>→</span>
        </Link>
      </div>

      {/* ── Current Level Hero Highlight ── */}
      {current && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white p-6 sm:p-8 shadow-lg border border-brand-800/60">
          {/* Dot grid decoration */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
            aria-hidden="true"
          />
          {/* Tricolor accent bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400 opacity-70"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/10 text-amber-300 border border-white/15 backdrop-blur-xs">
                  <span>Current CEFR level</span>
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {current.level}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-amber-300">
                  {current.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-brand-100/90 max-w-xl font-normal leading-relaxed">
                {LEVEL_CONFIG[current.level]?.description ||
                  'CEFR level overview and learning objectives.'}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end justify-center bg-white/10 border border-white/15 backdrop-blur-xs rounded-2xl p-4 sm:p-5 flex-shrink-0">
              <span className="text-xs font-semibold text-brand-200 uppercase tracking-wider">Lesson Target</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {current.completedLessons}
                <span className="text-base text-brand-300 font-normal"> / {current.targetLessons}</span>
              </div>
              <span className="text-[11px] text-amber-300 font-semibold mt-1">
                {Math.max(0, current.targetLessons - current.completedLessons)} sessions remaining at this level
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-bold text-brand-200 mb-2">
              <span>Level Completion Progress</span>
              <span>{(current.targetLessons > 0 ? Math.round((current.completedLessons / current.targetLessons) * 100) : 0)}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${current.targetLessons > 0 ? Math.min(100, Math.round((current.completedLessons / current.targetLessons) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Lessons Completed
              </span>
              <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-200/80 text-brand-700 flex items-center justify-center text-sm font-bold"><DashboardIcon name="book" className="h-4 w-4" /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCompleted}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Lessons recorded in your learning history
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Levels recorded
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center text-sm font-bold"><DashboardIcon name="clipboard" className="h-4 w-4" /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {completedLevelsCount} of {progress.length}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-semibold">
            Learning milestones on your record
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Program Progress
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 border border-purple-200/80 text-purple-700 flex items-center justify-center text-sm font-bold"><DashboardIcon name="chart" className="h-4 w-4" /></div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {(totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0)}%
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Across the levels in your learning plan
          </div>
        </div>
      </div>

      {/* ── CEFR Level Roadmap ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            CEFR learning path
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Levels from beginner to advanced
          </p>
        </div>

        <div className="space-y-3.5">
          {progress.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Your tutor has not recorded a level update yet.
            </div>
          ) : progress.map((p) => {
            const isCompleted = !!p.achievedAt
            const isCurrent = p.current
            const pct = (p.targetLessons > 0 ? Math.min(100, Math.round((p.completedLessons / p.targetLessons) * 100)) : 0)
            const cfg = LEVEL_CONFIG[p.level] || {
              badge: 'bg-slate-100 text-slate-800 border-slate-200',
              border: 'border-slate-200',
              accent: 'bg-slate-400',
              description: 'CEFR language stage.',
            }

            return (
              <div
                key={p.level}
                className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                  isCurrent
                    ? 'border-brand-400/90 shadow-md ring-1 ring-brand-400/40'
                    : isCompleted
                    ? 'border-emerald-200 shadow-2xs hover:border-emerald-300'
                    : 'border-slate-200 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base flex-shrink-0 shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600'
                          : isCurrent
                          ? 'bg-brand-700 ring-2 ring-amber-400'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : p.level}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-base">
                          {p.level} — {p.label}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Completed & Achieved
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 animate-pulse">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {cfg.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end justify-center self-start sm:self-auto flex-shrink-0">
                    <span className="text-xs font-bold text-slate-900">
                      {p.completedLessons} / {p.targetLessons} Lessons
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {isCompleted
                        ? 'Mastered on timetable'
                        : isCurrent
                        ? `${pct}% Completed`
                        : 'Future milestone'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-brand-600'
                          : 'bg-slate-200'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
