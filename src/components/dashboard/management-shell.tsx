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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <ManagementSidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Content Area: smoothly handles sidebar expansion without layout flicker */}
      <div
        className={`flex-1 flex flex-col min-w-0 max-w-full w-full transition-[padding-left] duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Stationary Fixed Header Container - Zero scroll bobbing, Zero jitter */}
        <div
          className={`fixed top-0 right-0 z-30 transition-[left] duration-300 ease-in-out ${
            collapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
          }`}
        >
          {/* Top Portuguese tricolor accent line pinned inside fixed header */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400" />
          <ManagementNavbar
            user={user}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
        </div>

        {/* Main Content Area - comfortably cleared below the fixed header, bounded max-width matching public site */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 pb-16 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
