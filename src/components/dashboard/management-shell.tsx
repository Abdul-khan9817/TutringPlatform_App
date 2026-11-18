'use client'

import { useState, useEffect } from 'react'
import { ManagementSidebar } from './management-sidebar'
import { ManagementNavbar, type ManagementNavbarUser } from './management-navbar'

export interface ManagementShellUser extends ManagementNavbarUser {}

export function ManagementShell({
  user,
  children,
}: {
  user: ManagementShellUser
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ws_sidebar_collapsed')
      if (saved === 'true') setCollapsed(true)
    } catch {}
  }, [])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('ws_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <ManagementSidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Content Area: smoothly handles sidebar expansion without layout flicker */}
      <div
        className={`flex flex-col min-h-screen min-w-0 max-w-full w-full transition-[padding-left] duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Stationary Fixed Header Container - Anchored, Opaque, zero overlap */}
        <div
          className={`fixed top-0 right-0 z-30 transition-[left] duration-300 ease-in-out bg-white border-b border-slate-200 shadow-xs ${
            collapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
          }`}
        >
          {/* Top Portuguese tricolor accent line */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400" />
          <ManagementNavbar
            user={user}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
        </div>

        {/* Main Content Area - comfortably cleared below the fixed header with generous spacing */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
