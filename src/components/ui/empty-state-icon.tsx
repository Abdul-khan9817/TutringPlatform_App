type EmptyStateIconName = 'calendar' | 'clipboard' | 'book' | 'payment' | 'inbox'

const iconPaths: Record<EmptyStateIconName, React.ReactNode> = {
  calendar: <><path d="M8 3v3m8-3v3M4 9h16" /><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6v3H9zM8 12h8M8 16h6" /></>,
  book: <><path d="M12 7v14m0-14C10.8 6.2 9.2 6 7.5 6 5.8 6 4 6.4 3 7v13c1-.6 2.8-1 4.5-1s3.3.2 4.5 1m0-13c1.2-.8 2.8-1 4.5-1 1.7 0 3.5.4 4.5 1v13c-1-.6-2.8-1-4.5-1s-3.3.2-4.5 1" /></>,
  payment: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  inbox: <><path d="M4 4h16l1 11-3 5H6l-3-5 1-11Z" /><path d="M3 14h5l2 3h4l2-3h5" /></>,
}

export function EmptyStateIcon({ name }: { name: EmptyStateIconName }) {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-700" aria-hidden="true">
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        {iconPaths[name]}
      </svg>
    </div>
  )
}
