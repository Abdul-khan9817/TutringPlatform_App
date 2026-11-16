import { getSession } from '@/lib/auth'
import { getStudentProgress } from '@/lib/student-data'

const LEVEL_COLOR: Record<string, string> = {
  A1: 'bg-emerald-500',
  A2: 'bg-teal-500',
  B1: 'bg-blue-500',
  B2: 'bg-indigo-500',
  C1: 'bg-purple-500',
  C2: 'bg-rose-500',
}

export default async function StudentProgressPage() {
  const session = await getSession()
  if (!session) return null

  const progress = getStudentProgress()
  const current = progress.find(p => p.current)
  const totalCompleted = progress.reduce((sum, p) => sum + p.completedLessons, 0)
  const totalTarget = progress.reduce((sum, p) => sum + p.targetLessons, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Progress</h1>
        <p className="text-slate-500 mt-1">Your CEFR language level journey</p>
      </div>

      {/* Current level highlight */}
      {current && (
        <div className="bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl p-7 text-white">
          <p className="text-sm font-semibold text-brand-200 uppercase tracking-wider mb-1">Current Level</p>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-5xl font-extrabold">{current.level}</p>
              <p className="text-brand-200 mt-1">{current.label}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-extrabold">{current.completedLessons}<span className="text-lg text-brand-300">/{current.targetLessons}</span></p>
              <p className="text-brand-200 text-sm">lessons completed</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="w-full bg-brand-800 rounded-full h-2.5">
              <div
                className="bg-white h-2.5 rounded-full transition-all"
                style={{ width: `${Math.round((current.completedLessons / current.targetLessons) * 100)}%` }}
              />
            </div>
            <p className="text-brand-300 text-xs mt-1.5">
              {current.targetLessons - current.completedLessons} lessons to reach {progress[progress.findIndex(p => p.current) + 1]?.level ?? 'C2'}
            </p>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Lessons</p>
          <p className="text-2xl font-extrabold text-brand-700">{totalCompleted}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Levels Completed</p>
          <p className="text-2xl font-extrabold text-slate-900">{progress.filter(p => p.achievedAt).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Overall Progress</p>
          <p className="text-2xl font-extrabold text-slate-900">{Math.round((totalCompleted / totalTarget) * 100)}%</p>
        </div>
      </div>

      {/* CEFR roadmap */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">CEFR Level Roadmap</h2>
        <div className="space-y-3">
          {progress.map((p, idx) => {
            const pct = Math.min(100, Math.round((p.completedLessons / p.targetLessons) * 100))
            const isCompleted = !!p.achievedAt
            const isCurrent = p.current
            const isLocked = !isCompleted && !isCurrent

            return (
              <div
                key={p.level}
                className={`bg-white rounded-xl border p-5 ${
                  isCurrent ? 'border-brand-400 shadow-sm' : isCompleted ? 'border-green-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-white text-sm flex-shrink-0 ${
                    isCompleted ? 'bg-green-500' : isCurrent ? (LEVEL_COLOR[p.level] ?? 'bg-brand-700') : 'bg-slate-300'
                  }`}>
                    {isCompleted ? '✓' : p.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-slate-900">{p.level}</span>
                        <span className="text-slate-500 text-sm ml-2">{p.label}</span>
                        {isCurrent && (
                          <span className="ml-2 text-xs font-semibold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {p.completedLessons}/{p.targetLessons} lessons
                        {isCompleted && p.achievedAt && (
                          <span className="ml-2 text-green-600">
                            · Achieved {new Date(p.achievedAt).toLocaleDateString('en-PT', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </span>
                    </div>
                    {!isLocked && (
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isCompleted ? 'bg-green-500' : (LEVEL_COLOR[p.level] ?? 'bg-brand-600')}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
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
