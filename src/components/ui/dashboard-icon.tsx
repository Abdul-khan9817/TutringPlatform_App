export type DashboardIconName =
  | 'user'
  | 'users'
  | 'calendar'
  | 'bolt'
  | 'chart'
  | 'clipboard'
  | 'book'
  | 'payment'
  | 'package'
  | 'shield'
  | 'globe'

const paths: Record<DashboardIconName, React.ReactNode> = {
  user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  bolt: <path d="m13 2-3 9h7l-6 11 2-9H6l7-11Z" />,
  chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6v3H9zM8 12h8M8 16h6" /></>,
  book: <><path d="M12 7v14m0-14C10.8 6.2 9.2 6 7.5 6 5.8 6 4 6.4 3 7v13c1-.6 2.8-1 4.5-1s3.3.2 4.5 1m0-13c1.2-.8 2.8-1 4.5-1 1.7 0 3.5.4 4.5 1v13c-1-.6-2.8-1-4.5-1s-3.3.2-4.5 1" /></>,
  payment: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  package: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" /></>,
}

export function DashboardIcon({ name, className = 'h-4 w-4' }: { name: DashboardIconName; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
