export default function StudentLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-pulse" role="status" aria-label="Loading student page">
      <span className="sr-only">Loading student page…</span>
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-9 w-72 rounded-lg bg-slate-200" />
        <div className="h-4 max-w-xl rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 rounded-2xl border border-slate-200 bg-white" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
        <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  )
}
