import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Cookie Policy' }

export default function CookiesPage() {
  return (
    <div className="section">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Cookie Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().getFullYear()}</p>
        </div>
        <div className="legal-prose">
          <h2>What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit a website.</p>
          <h2>Cookies We Use</h2>
          <ul>
            <li><strong>Authentication cookies:</strong> HTTP-only session cookies required for logged-in functionality. These cannot be disabled without logging out.</li>
            <li><strong>No third-party tracking cookies</strong> are used by default on this platform.</li>
          </ul>
          <h2>Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Disabling authentication cookies will prevent you from accessing your account.</p>
          <h2>Contact</h2>
          <p>For questions about our cookie use: <a href="mailto:hello@workspeakportugal.com">hello@workspeakportugal.com</a></p>
        </div>
      </div>
    </div>
  )
}
