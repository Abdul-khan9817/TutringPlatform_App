export default function ManagementLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-pulse" role="status" aria-label="Loading management page">
      <span className="sr-only">Loading management page…</span>
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="h-9 w-64 rounded-lg bg-slate-200" />
        <div className="h-4 max-w-xl rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-2xl border border-slate-200 bg-white" />)}
      </div>
      <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
    </div>
  )
}
