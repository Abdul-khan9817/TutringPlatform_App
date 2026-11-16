export function PortugalFlagIcon({ className = 'h-3.5 w-5' }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-2xs shadow-2xs inline-block flex-shrink-0 overflow-hidden`}
      viewBox="0 0 600 400"
      aria-hidden="true"
    >
      <rect width="240" height="400" fill="#046A38" />
      <rect x="240" width="360" height="400" fill="#DA291C" />
      <circle cx="240" cy="200" r="80" fill="#FFCD00" stroke="#000" strokeWidth="3" />
      <path d="M240 140 v120 M180 200 h120" stroke="#046A38" strokeWidth="6" />
      <circle cx="240" cy="200" r="45" fill="#DA291C" />
      <circle cx="240" cy="200" r="30" fill="#FFFFFF" />
      <path d="M232 188 h16 v24 h-16 z" fill="#002B7F" />
    </svg>
  )
}

export function UKFlagIcon({ className = 'h-3.5 w-5' }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-2xs shadow-2xs inline-block flex-shrink-0 overflow-hidden`}
      viewBox="0 0 60 30"
      aria-hidden="true"
    >
      <path d="M0 0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0 v30 M0 15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0 v30 M0 15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

export function DualFlagIcon({ className = 'h-3.5 w-7' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center -space-x-1 ${className} flex-shrink-0`}>
      <PortugalFlagIcon className="h-3 w-4 z-10" />
      <UKFlagIcon className="h-3 w-4" />
    </span>
  )
}
