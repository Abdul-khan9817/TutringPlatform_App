'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: (props: { className?: string }) => React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: '/management/dashboard',
    label: 'Dashboard',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/management/assessments',
    label: 'Assessments',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/management/students',
    label: 'Students',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: '/management/bookings',
    label: 'Bookings',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/management/materials',
    label: 'Materials',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: '/management/payments',
    label: 'Payments',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: '/management/settings',
    label: 'Settings',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

interface User {
  name: string
  email: string
  role: string
  avatarUrl?: string
  title?: string
}

interface ManagementSidebarProps {
  user: User
  collapsed?: boolean
  onToggleCollapse?: () => void
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export function ManagementSidebar({
  user,
  collapsed = false,
  onToggleCollapse,
  mobileOpen: controlledMobileOpen,
  setMobileOpen: controlledSetMobileOpen,
}: ManagementSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const mobileOpen = controlledMobileOpen !== undefined ? controlledMobileOpen : internalMobileOpen
  const setMobileOpen = controlledSetMobileOpen || setInternalMobileOpen

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isSlim = !isMobile && collapsed

    return (
      <div className="flex flex-col h-full bg-white select-none">
        {/* Header / Brand */}
        <div className={`border-b border-slate-200 transition-all duration-300 ${isSlim ? 'p-3' : 'p-4 sm:p-5'}`}>
          {/* Top Portuguese tricolor accent line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400 mb-3 rounded-full" />

          <div className={`flex items-center ${isSlim ? 'justify-center' : 'justify-between'}`}>
            <Link
              href="/management/dashboard"
              className="flex items-center gap-2.5 group"
              title="WorkSpeak Portugal Administration"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <span className="text-white font-black text-sm">W</span>
              </div>
              {!isSlim && (
                <div className="flex flex-col overflow-hidden animate-fade-in">
                  <span className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                    WorkSpeak<span className="text-brand-600"> Portugal</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Administration</span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle Button */}
            {!isMobile && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {!isSlim && (
            <div className="mt-2.5 animate-fade-in">
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-300/40">
                {user.role === 'ADMIN' ? 'Full Administrator' : 'Tutor Portal'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 overflow-y-auto space-y-1 transition-all duration-300 ${isSlim ? 'p-2' : 'p-3'}`}
          aria-label="Management navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const IconComponent = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isSlim ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isSlim ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-brand-900 text-white shadow-xs ring-1 ring-brand-950'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {!isSlim && <span className="truncate animate-fade-in">{item.label}</span>}
              </Link>
            )
          })}

          {/* Student Portal Switcher */}
          <div className="pt-3 pb-1 border-t border-slate-100 mt-3">
            {!isSlim && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 animate-fade-in">
                Platform Access
              </p>
            )}
            <Link
              href="/student/dashboard"
              title={isSlim ? 'Open Student Portal' : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors ${
                isSlim ? 'justify-center p-2.5' : 'px-3 py-2'
              }`}
            >
              <span className="text-base leading-none">🎓</span>
              {!isSlim && <span className="truncate animate-fade-in">Student Portal</span>}
            </Link>
          </div>
        </nav>

        {/* Footer / User Profile & Logout */}
        <div className={`border-t border-slate-200 transition-all duration-300 ${isSlim ? 'p-2' : 'p-3'}`}>
          {!isSlim ? (
            <div className="mb-2 px-2 flex items-center gap-2.5 animate-fade-in">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover border border-slate-200"
                  title={`${user.name} (${user.email})`}
                />
              ) : (
                <div
                  className="h-7 w-7 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs"
                  title={`${user.name} (${user.email})`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            title={isSlim ? 'Log Out' : undefined}
            className={`w-full flex items-center gap-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors ${
              isSlim ? 'justify-center p-2.5' : 'px-3 py-2'
            }`}
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isSlim && <span className="truncate">Log Out</span>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Animated Sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r border-slate-200 z-40 transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-up">
            <SidebarContent isMobile />
          </div>
        </div>
      )}
    </>
  )
}
