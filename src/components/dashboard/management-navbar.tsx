'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AdminNotification } from '@/lib/admin-data'
import { DashboardIcon } from '@/components/ui/dashboard-icon'

export interface ManagementNavbarUser {
  name: string
  email: string
  role: string
  avatarUrl?: string
  title?: string
}

interface ManagementNavbarProps {
  user: ManagementNavbarUser
  onOpenMobileMenu?: () => void
}

export function ManagementNavbar({ user, onOpenMobileMenu }: ManagementNavbarProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Fetch live notifications
  useEffect(() => {
    let isMounted = true
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/v1/admin/actions', {
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
    return () => {
      isMounted = false
    }
  }, [])

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
      await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_ALL_NOTIFICATIONS_READ' }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/v1/admin/actions', {
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
      await fetch('/api/v1/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_NOTIFICATIONS' }),
      })
      setNotifications([])
    } catch {}
  }

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const getNotifIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'ASSESSMENT': return 'clipboard' as const
      case 'BOOKING': return 'calendar' as const
      case 'PAYMENT': return 'payment' as const
      default: return 'bolt' as const
    }
  }

  const userInitial = (user.name || 'A').charAt(0).toUpperCase()

  return (
    <header className="w-full bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Navigation Anchor */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Mobile Brand Title */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-xs">
              <span className="text-white font-black text-xs">W</span>
            </div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              WorkSpeak<span className="text-brand-600"> Admin</span>
            </span>
          </div>
        </div>

        {/* Right: Quick actions, Notifications & Admin Profile */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* ── Notification Bell ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
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
                      Mark all as read
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
                  <div className="border-t border-slate-100 p-2.5 bg-slate-50/70 flex justify-between items-center text-xs">
                    <button
                      onClick={handleClearAll}
                      className="text-slate-600 hover:text-red-600 font-medium text-[11px]"
                    >
                      Clear all
                    </button>
                    <Link
                      href="/management/assessments"
                      onClick={() => setNotifOpen(false)}
                      className="text-brand-700 hover:text-brand-900 font-semibold text-[11px]"
                    >
                      View Assessments →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Admin Profile Dropdown Menu ── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Open user profile menu"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-slate-300 shadow-2xs"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                  {userInitial}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-semibold text-brand-700 leading-tight">
                  Administrator
                </span>
              </div>
              <svg
                className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
                  profileOpen ? 'rotate-180 text-slate-700' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Menu Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in divide-y divide-slate-100">
                {/* Header with full info */}
                <div className="p-4 bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                        {userInitial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-600 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        Admin Privileges
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation items */}
                <div className="p-2 space-y-1 text-xs">
                  <Link
                    href="/management/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"
                  >
                    <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile & Settings</span>
                  </Link>
                </div>

                {/* Logout button */}
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
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
