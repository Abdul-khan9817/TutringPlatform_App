import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'WorkSpeak Portugal — Professional Portuguese & English Language Lessons',
    template: '%s | WorkSpeak Portugal',
  },
  description:
    'Professional Portuguese and English language lessons designed for workers, professionals, and international communities in Portugal. Book your free 15-minute assessment today.',
  keywords: [
    'Portuguese lessons Portugal',
    'English lessons Portugal',
    'language tutor Lisbon',
    'Portuguese for foreigners',
    'workplace language training Portugal',
    'aulas de português',
    'aulas de inglês',
  ],
  authors: [{ name: 'WorkSpeak Portugal' }],
  creator: 'WorkSpeak Portugal',
  openGraph: {
    type: 'website',
    locale: 'en_PT',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'WorkSpeak Portugal',
    title: 'WorkSpeak Portugal — Professional Language Lessons',
    description:
      'Practical Portuguese and English lessons for workers, professionals, and international communities in Portugal.',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
