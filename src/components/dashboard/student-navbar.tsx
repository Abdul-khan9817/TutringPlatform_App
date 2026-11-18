'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { StudentNotification } from '@/lib/student-data'
import { DashboardIcon } from '@/components/ui/dashboard-icon'

export interface StudentNavbarUser {
  name: string
  email: string
  role?: string
  avatarUrl?: string
}

interface StudentNavbarProps {
  user: StudentNavbarUser
  onOpenMobileMenu?: () => void
}

export function StudentNavbar({ user, onOpenMobileMenu }: StudentNavbarProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<StudentNotification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Fetch live notifications
  useEffect(() => {
    let isMounted = true
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/v1/student/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'GET_NOTIFICATIONS' }),
        })
        const json = await res.json()
        if (json.success && json.data && isMounted) {
          setNotifications(json.data)
        }
      } catch {}
    }

    fetchNotifs()
    const refreshId = window.setInterval(fetchNotifs, 20_000)
    return () => {
      isMounted = false
      window.clearInterval(refreshId)
    }
  }, [])

  useEffect(() => {
    const refreshId = window.setInterval(() => router.refresh(), 20_000)
    return () => window.clearInterval(refreshId)
  }, [router])

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_ALL_NOTIFICATIONS_READ' }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_NOTIFICATION_READ', payload: { id } }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {}
  }

  const handleClearAll = async () => {
    try {
      await fetch('/api/v1/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_NOTIFICATIONS' }),
      })
      setNotifications([])
    } catch {}
  }

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const getNotifIcon = (type: StudentNotification['type']) => {
    switch (type) {
      case 'LESSON': return 'calendar' as const
      case 'HOMEWORK': return 'clipboard' as const
      case 'PACKAGE': return 'package' as const
      default: return 'book' as const
    }
  }

  const userInitial = (user.name || 'S').charAt(0).toUpperCase()

  return (
    <header className="w-full bg-white select-none">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open student navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Mobile Brand Title */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-xs">
              <span className="text-white font-extrabold text-xs">W</span>
            </div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              WorkSpeak<span className="text-brand-600"> Student</span>
            </span>
          </div>

          {/* Desktop Breadcrumb/Context Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Student Portal</span>
            </span>
            <span>·</span>
            <span className="font-medium text-slate-600">WorkSpeak Language Academy</span>
          </div>
        </div>

        {/* Right: Quick actions, Notifications & Student Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Class Booking Shortcut */}
          <Link
            href="/student/bookings"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-brand-50 hover:border-brand-300 text-xs font-semibold text-slate-700 hover:text-brand-800 transition-all shadow-2xs"
            title="View or schedule your language lessons"
          >
            <DashboardIcon name="calendar" />
            <span>My Schedule</span>
          </Link>

          {/* ── Notification Bell ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="View notifications"
              title="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-brand-100 text-brand-800 px-2 py-0.5 text-[10px] font-extrabold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-600 text-xs">
                      <p className="font-semibold text-slate-700">All caught up!</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">No new notifications at this time.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          handleMarkAsRead(notif.id)
                          if (notif.link) {
                            router.push(notif.link)
                            setNotifOpen(false)
                          }
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><DashboardIcon name={getNotifIcon(notif.type)} /></span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{notif.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                      onClick={handleClearAll}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Student Profile Dropdown ── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Student account menu"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-600 font-medium leading-none mt-0.5">
                  Student Account
                </span>
              </div>
              <svg className="hidden sm:block h-3.5 w-3.5 text-slate-600 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in p-1.5">
                <div className="px-3 py-3 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{user.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active Student
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs font-medium text-slate-700">
                  <Link
                    href="/student/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <DashboardIcon name="user" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/student/progress"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <DashboardIcon name="chart" />
                    <span>Learning Progress & CEFR</span>
                  </Link>

                  <Link
                    href="/student/bookings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <DashboardIcon name="calendar" />
                    <span>Scheduled Lessons</span>
                  </Link>

                  <Link
                    href="/student/packages"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <DashboardIcon name="package" />
                    <span>Lesson Credits & Packages</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/management/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors font-semibold"
                    >
                      <DashboardIcon name="shield" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <DashboardIcon name="globe" />
                    <span>Public Website</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
