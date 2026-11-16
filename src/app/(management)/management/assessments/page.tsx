import { getSession } from '@/lib/auth'
import { getAdminAssessments } from '@/lib/admin-data'
import { AssessmentsClient } from './assessments-client'

export default async function ManagementAssessmentsPage() {
  const session = await getSession()
  if (!session) return null

  const assessments = await getAdminAssessments()
  const pendingCount = assessments.filter((a) => a.status === 'NEW').length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
              Admissions Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment Inquiries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming language proficiency assessments, assign CEFR tracks, and schedule evaluation calls.
          </p>
        </div>

        <div className="text-xs font-bold text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto shadow-2xs">
          {pendingCount === 1 ? '1 Pending Inquiry' : `${pendingCount} Pending Inquiries`}
        </div>
      </div>

      <AssessmentsClient initialAssessments={assessments} />
    </div>
  )
}
