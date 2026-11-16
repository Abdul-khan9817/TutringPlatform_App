import { getSession } from '@/lib/auth'
import { getStudentMaterials } from '@/lib/student-data'

const TYPE_ICON: Record<string, string> = {
  PDF: '📄',
  AUDIO: '🎧',
  VIDEO: '🎬',
  WORKSHEET: '📋',
  LINK: '🔗',
}

const TYPE_COLOR: Record<string, string> = {
  PDF: 'bg-red-50 text-red-700 border-red-200',
  AUDIO: 'bg-purple-50 text-purple-700 border-purple-200',
  VIDEO: 'bg-blue-50 text-blue-700 border-blue-200',
  WORKSHEET: 'bg-amber-50 text-amber-700 border-amber-200',
  LINK: 'bg-slate-50 text-slate-700 border-slate-200',
}

export default async function StudentMaterialsPage() {
  const session = await getSession()
  if (!session) return null

  const materials = getStudentMaterials()

  const portuguese = materials.filter(m => m.language === 'PORTUGUESE')
  const english = materials.filter(m => m.language === 'ENGLISH')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Learning Materials</h1>
        <p className="text-slate-500 mt-1">Resources shared by your tutor</p>
      </div>

      {materials.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-2xl mb-3" aria-hidden="true">📚</p>
          <p className="font-semibold text-slate-700">No materials yet</p>
          <p className="text-sm text-slate-500 mt-1">Your tutor will share materials as your lessons progress.</p>
        </div>
      )}

      {portuguese.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            🇵🇹 <span>Portuguese Materials</span>
          </h2>
          <div className="space-y-3">
            {portuguese.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center text-lg ${TYPE_COLOR[m.type]}`}>
                    {TYPE_ICON[m.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-slate-900">{m.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{m.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {m.level}
                        </span>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline"
                        >
                          Request →
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Added {new Date(m.uploadedAt).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {english.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            🇬🇧 <span>English Materials</span>
          </h2>
          <div className="space-y-3">
            {english.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center text-lg ${TYPE_COLOR[m.type]}`}>
                    {TYPE_ICON[m.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-slate-900">{m.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{m.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {m.level}
                        </span>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline"
                        >
                          Request →
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Added {new Date(m.uploadedAt).toLocaleDateString('en-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
