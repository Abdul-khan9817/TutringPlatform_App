import { EmptyStateIcon } from '@/components/ui/empty-state-icon'
import { getSession } from '@/lib/auth'
import { getStudentMaterialsFromDatabase } from '@/lib/dashboard-data'
import { PortugalFlagIcon, UKFlagIcon } from '@/components/ui/flags'

export const dynamic = 'force-dynamic'

const TYPE_CONFIG: Record<
  string,
  { icon: string; badge: string; label: string }
> = {
  PDF: {
    icon: '📄',
    badge: 'bg-red-50 text-red-800 border-red-200',
    label: 'PDF Handout',
  },
  AUDIO: {
    icon: '🎧',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
    label: 'Audio Dialogue',
  },
  VIDEO: {
    icon: '🎬',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    label: 'Video Masterclass',
  },
  WORKSHEET: {
    icon: '📋',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Exercise Worksheet',
  },
  LINK: {
    icon: '🔗',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    label: 'Reference Resource',
  },
}

export default async function StudentMaterialsPage() {
  const session = await getSession()
  if (!session) return null

  const materials = await getStudentMaterialsFromDatabase(session.sub)

  const portuguese = materials.filter((m) => m.language === 'PORTUGUESE' || m.language === 'BOTH')
  const english = materials.filter((m) => m.language === 'ENGLISH' || m.language === 'BOTH')

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full">
              Study library
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Study Materials
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Find resources shared for your lessons.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs self-start sm:self-auto">
          {materials.length} {materials.length === 1 ? 'resource' : 'resources'}
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <EmptyStateIcon name="book" />
          <p className="font-extrabold text-base text-slate-900">No study materials shared yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Materials shared with you will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Portuguese Track */}
          {portuguese.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <PortugalFlagIcon className="h-4 w-5" />
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Portuguese Language Handouts
                  </h2>
                  <span className="text-xs font-bold text-slate-400">({portuguese.length})</span>
                </div>
                <span className="text-xs font-semibold text-brand-700">A1–B2 Curriculum</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portuguese.map((m) => {
                  const cfg = TYPE_CONFIG[m.type] || {
                    icon: '📄',
                    badge: 'bg-slate-100 text-slate-800 border-slate-200',
                    label: m.type,
                  }

                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-brand-400/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              Level {m.level}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {m.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Added {new Date(m.uploadedAt).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Open Resource</span>
                          <span>↗</span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* English Track */}
          {english.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <UKFlagIcon className="h-4 w-5" />
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Professional English Materials
                  </h2>
                  <span className="text-xs font-bold text-slate-400">({english.length})</span>
                </div>
                <span className="text-xs font-semibold text-brand-700">Business & Presentation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {english.map((m) => {
                  const cfg = TYPE_CONFIG[m.type] || {
                    icon: '📄',
                    badge: 'bg-slate-100 text-slate-800 border-slate-200',
                    label: m.type,
                  }

                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-brand-400/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              Level {m.level}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {m.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Added {new Date(m.uploadedAt).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Open Resource</span>
                          <span>↗</span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
