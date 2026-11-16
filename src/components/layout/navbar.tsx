'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/* ── Crisp Vector Flags ── */
function PortugalFlag({ className = 'h-4 w-5' }: { className?: string }) {
  return (
    <svg className={`${className} rounded-sm overflow-hidden flex-shrink-0 shadow-xs`} viewBox="0 0 600 400" aria-hidden="true">
      <rect width="240" height="400" fill="#046A38" />
      <rect x="240" width="360" height="400" fill="#DA291C" />
      <circle cx="240" cy="200" r="80" fill="#FFE900" />
      <circle cx="240" cy="200" r="50" fill="#DA291C" />
      <circle cx="240" cy="200" r="30" fill="#FFFFFF" />
    </svg>
  )
}

function UKFlag({ className = 'h-4 w-5' }: { className?: string }) {
  return (
    <svg className={`${className} rounded-sm overflow-hidden flex-shrink-0 shadow-xs`} viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id="uk-flag-clean-clip"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="uk-flag-clean-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#uk-flag-clean-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-flag-clean-diag)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  )
}

/* ── Primary Navigation Links ── */
const navLinks = [
  {
    href: '/',
    label: 'Home',
    renderIcon: () => (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/portuguese',
    label: 'Portuguese',
    renderIcon: () => <PortugalFlag />,
  },
  {
    href: '/english',
    label: 'English',
    renderIcon: () => <UKFlag />,
  },
  {
    href: '/pricing',
    label: 'Pricing',
    renderIcon: () => (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: '/contact',
    label: 'Contact',
    renderIcon: () => (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile drawer on route transition
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1738] border-b border-white/10 shadow-lg shadow-black/25">
      {/* Portuguese tricolor accent line */}
      <div
        className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Brand Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-3 group flex-shrink-0"
            aria-label="WorkSpeak Portugal Homepage"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200 border border-brand-400/30">
              <span className="text-white font-extrabold text-base tracking-tight">W</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none">
                WorkSpeak<span className="text-brand-300"> Portugal</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
                Language Academy
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation with Clear Visited Highlight ── */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.renderIcon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-colors duration-150 ${
                    isActive
                      ? 'bg-white/20 text-white font-bold ring-1 ring-white/30 border-b-2 border-amber-400 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* ── Desktop Right Actions with Active States ── */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
            {/* Green Sign In Button */}
            <Link
              href="/login"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors duration-150 ${
                pathname === '/login'
                  ? 'bg-emerald-500 text-white font-bold ring-2 ring-white shadow-lg'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold shadow-sm shadow-emerald-950/30'
              }`}
              aria-current={pathname === '/login' ? 'page' : undefined}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign in</span>
            </Link>

            {/* Book Free Assessment Button */}
            <Link
              href="/assessment"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors duration-150 whitespace-nowrap ${
                pathname === '/assessment'
                  ? 'bg-amber-300 text-slate-950 font-extrabold ring-2 ring-white shadow-lg scale-102'
                  : 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              }`}
              aria-current={pathname === '/assessment' ? 'page' : undefined}
            >
              <span>Book Free Assessment</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* ── Mobile Hamburger Menu Toggle ── */}
          <button
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer with Bold Visited Highlights ── */}
      {open && (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-white/10 bg-[#0a1738] text-white animate-slide-down shadow-2xl"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.renderIcon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-white/20 text-white font-bold border-l-4 border-amber-400 pl-3.5 shadow-sm'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 flex items-center justify-center flex-shrink-0">
                      <Icon />
                    </div>
                    <span>{link.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                        Active
                      </span>
                    )}
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}

            {/* Clean subtle divider */}
            <div className="pt-3 pb-1 border-t border-white/10 my-2" />

            {/* Sign In (Green Button with Active State) */}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm transition-all duration-150 ${
                pathname === '/login'
                  ? 'bg-emerald-500 text-white font-bold ring-2 ring-white shadow-lg'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold shadow-md'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign in</span>
            </Link>

            {/* Book Free Assessment (Amber CTA Button with Active State) */}
            <Link
              href="/assessment"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm transition-all duration-150 ${
                pathname === '/assessment'
                  ? 'bg-amber-300 text-slate-950 font-extrabold ring-2 ring-white shadow-lg'
                  : 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold shadow-md'
              }`}
            >
              <span>Book Free Assessment</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop overlay for mobile menu */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 top-[66px] bg-black/60 z-[-1] animate-fade-in"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  )
}
