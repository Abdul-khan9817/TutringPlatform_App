'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const footerLinks = {
  lessons: [
    { href: '/portuguese', label: 'Portuguese Lessons' },
    { href: '/english', label: 'English Lessons' },
    { href: '/pricing', label: 'Pricing & Packages' },
    { href: '/assessment', label: 'Free Assessment' },
  ],
  company: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
  account: [
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Create Account' },
    { href: '/student/dashboard', label: 'My Dashboard' },
  ],
}

function FooterLinkGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  const pathname = usePathname()

  return (
    <div>
      <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`group inline-flex items-center gap-2 text-sm transition-all duration-150 rounded-lg py-1 px-2.5 -ml-2.5 ${
                  isActive
                    ? 'text-amber-300 font-bold bg-white/15 border-l-2 border-amber-400 pl-3 shadow-xs'
                    : 'text-brand-100/80 hover:text-white hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-150 flex-shrink-0 ${
                    isActive ? 'bg-amber-400 scale-125' : 'bg-brand-300/40 group-hover:bg-amber-300 group-hover:scale-125'
                  }`}
                  aria-hidden="true"
                />
                <span className="group-hover:underline underline-offset-4 decoration-white/40">{link.label}</span>
                {isActive && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-300/30 ml-1">
                    Active
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Footer() {
  const router = useRouter()
  const [lastTap, setLastTap] = useState(0)
  const whatsappRaw = process.env.NEXT_PUBLIC_WHATSAPP ?? '+351916869857'
  const phone = whatsappRaw.replace(/\D/g, '')

  // Secret admin trigger on double-click / double-tap of "©" -> Opens dedicated Admin Login
  const handleAdminTrigger = () => {
    router.push('/admin/login')
  }

  const handleTouchTrigger = () => {
    const now = Date.now()
    if (now - lastTap < 400) {
      router.push('/admin/login')
    }
    setLastTap(now)
  }

  // Open Gmail web compose in a new tab, or fallback to default email client
  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=info.al-kudsh9817@gmail.com'
    const newWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer')
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = 'mailto:info.al-kudsh9817@gmail.com'
    }
  }

  return (
    <footer className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-brand-100 border-t border-white/10 overflow-hidden">
      {/* Portuguese tricolor top accent */}
      <div
        className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0 border border-brand-400/40">
                <span className="text-white font-extrabold text-base">W</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base leading-tight group-hover:text-amber-300 transition-colors">
                  WorkSpeak<span className="text-amber-300"> Portugal</span>
                </span>
                <span className="text-[10px] font-medium text-brand-200/80 leading-none mt-0.5">
                  Language Academy
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-brand-100/80 mb-6">
              Professional Portuguese and English language lessons for workers, professionals, and international communities in Portugal.
            </p>
            <a
              href={`https://wa.me/${phone}?text=Hello%2C%20I%20am%20interested%20in%20language%20lessons`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 shadow-sm"
              aria-label="Contact us on WhatsApp"
            >
              <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="h-4 w-4 fill-current text-emerald-400" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <FooterLinkGroup title="Lessons" links={footerLinks.lessons} />
          <FooterLinkGroup title="Company" links={footerLinks.company} />
          <FooterLinkGroup title="Account" links={footerLinks.account} />
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-brand-200/80">
            <span
              onClick={handleTouchTrigger}
              onDoubleClick={handleAdminTrigger}
              className="cursor-pointer select-none hover:text-amber-300 transition-colors inline-block font-semibold"
              title="WorkSpeak Portugal Admin Portal"
              aria-label="Copyright symbol (Double tap for admin login)"
            >
              ©
            </span>{' '}
            {new Date().getFullYear()} WorkSpeak Portugal. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1.5 text-xs text-brand-200/80">
            <a
              href="https://al-kudos-digital-solution.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-300 hover:text-white no-underline transition-colors"
            >
              https://al-kudos-digital-solution.vercel.app
            </a>
            <span className="text-white/25" aria-hidden="true">·</span>
            <a
              href="mailto:info.al-kudsh9817@gmail.com"
              onClick={handleEmailClick}
              className="inline-flex items-center gap-1.5 text-brand-200/90 hover:text-amber-300 no-underline transition-colors cursor-pointer"
              title="Click to compose email in Gmail / email app"
            >
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info.al-kudsh9817@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
