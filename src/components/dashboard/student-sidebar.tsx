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
    href: '/student/dashboard',
    label: 'Dashboard',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/student/bookings',
    label: 'My Bookings',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/student/packages',
    label: 'Lesson Packages',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/student/progress',
    label: 'My Progress',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/student/materials',
    label: 'Study Materials',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: '/student/homework',
    label: 'Homework & Tasks',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/student/payments',
    label: 'Payments & Receipts',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: '/student/profile',
    label: 'Student Profile',
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

interface User {
  name: string
  email: string
  role?: string
}

interface StudentSidebarProps {
  user: User
  collapsed?: boolean
  onToggleCollapse?: () => void
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export function StudentSidebar({
  user,
  collapsed = false,
  onToggleCollapse,
  mobileOpen: controlledMobileOpen,
  setMobileOpen: controlledSetMobileOpen,
}: StudentSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const mobileOpen = controlledMobileOpen !== undefined ? controlledMobileOpen : internalMobileOpen
  const setMobileOpen = controlledSetMobileOpen || setInternalMobileOpen

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const userInitial = (user.name || 'S').charAt(0).toUpperCase()

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
              href="/student/dashboard"
              className="flex items-center gap-2.5 group"
              title="WorkSpeak Portugal Student Portal"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <span className="text-white font-extrabold text-sm">W</span>
              </div>
              {!isSlim && (
                <div className="flex flex-col overflow-hidden animate-fade-in">
                  <span className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                    WorkSpeak<span className="text-brand-600"> Portugal</span>
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium">Student Portal</span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle Button */}
            {!isMobile && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
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
            <div className="mt-2.5 animate-fade-in flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-200">
                Learner Portal
              </span>
              <span className="text-[10px] font-semibold text-slate-600">
                A1–C1 Track
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 overflow-y-auto space-y-1 transition-all duration-300 ${isSlim ? 'p-2' : 'p-3'}`}
          aria-label="Student navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname.startsWith(item.href))
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
                <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
                {!isSlim && <span className="truncate animate-fade-in">{item.label}</span>}
              </Link>
            )
          })}

          {/* Quick Access to Main Website & Admin Switcher */}
          {!isSlim && (
            <div className="pt-3 pb-1 border-t border-slate-100 mt-4 space-y-1 animate-fade-in">
              <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Quick Navigation
              </p>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span>🌐</span>
                <span>Main Academy Website</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/management/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/80"
                >
                  <span>🛡️</span>
                  <span>Return to Admin Portal</span>
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Footer: User profile info + logout */}
        <div className={`border-t border-slate-200 transition-all duration-300 ${isSlim ? 'p-2' : 'p-3 sm:p-4'}`}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 ${isSlim ? 'justify-center' : ''}`}>
              <div
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-xs cursor-pointer"
                title={user.name}
                onClick={() => router.push('/student/profile')}
              >
                {userInitial}
              </div>
              {!isSlim && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className={`relative flex h-10 flex-shrink-0 items-center rounded-xl border border-red-200 bg-red-50 text-red-700 shadow-xs transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-800 hover:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${isSlim ? 'w-10 justify-center self-center' : 'w-full justify-start pl-12 text-xs font-semibold'}`}
            >
              <svg className={`h-4 w-4 ${isSlim ? '' : 'absolute left-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isSlim && <span>Log out</span>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col bg-white border-r border-slate-200 transition-[width] duration-300 ease-in-out shadow-xs ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
        aria-label="Student sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl animate-slide-up flex flex-col z-10">
            <SidebarContent isMobile={true} />
          </div>
        </div>
      )}
    </>
  )
}
