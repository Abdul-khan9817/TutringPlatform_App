import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs))
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-brand-100 text-brand-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
  neutral: 'bg-slate-100 text-slate-700',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-150 select-none',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDING_PAYMENT: { label: 'Pending Payment', variant: 'warning' },
    CONFIRMED: { label: 'Confirmed', variant: 'success' },
    COMPLETED: { label: 'Completed', variant: 'neutral' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },
    EXPIRED: { label: 'Expired', variant: 'neutral' },
    REFUNDED: { label: 'Refunded', variant: 'info' },
    NO_SHOW: { label: 'No Show', variant: 'danger' },
  }
  const config = map[status] ?? { label: status, variant: 'neutral' as BadgeVariant }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
