export default function ManagementDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8" role="status" aria-label="Loading dashboard">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
      <span className="sr-only">Loading your dashboard…</span>
    </div>
  )
}
