import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="section">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().getFullYear()}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> This is a template privacy policy. It must be reviewed and approved by a qualified legal professional before this platform accepts live users or processes personal data. It must be adapted to comply with GDPR and applicable Portuguese and EU law.
          </p>
        </div>
        <div className="legal-prose">
          <h2>1. Controller</h2>
          <p>WorkSpeak Portugal is the data controller for personal data collected through this platform.</p>
          <h2>2. Data We Collect</h2>
          <ul>
            <li>Name, email address, phone number</li>
            <li>Language level and learning goals</li>
            <li>Booking and lesson history</li>
            <li>Payment information (processed by Stripe — we do not store card details)</li>
            <li>Usage data and cookies</li>
          </ul>
          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To provide language tutoring services</li>
            <li>To process bookings and payments</li>
            <li>To send lesson reminders and service communications</li>
            <li>To improve our platform</li>
          </ul>
          <h2>4. Legal Basis</h2>
          <p>We process your data based on contract performance, legitimate interests, and your consent where required.</p>
          <h2>5. Your Rights</h2>
          <p>Under GDPR you have the right to access, correct, delete, and port your personal data. Contact us to exercise these rights.</p>
          <h2>6. Data Retention</h2>
          <p>We retain personal data for as long as necessary to provide our services and comply with legal obligations.</p>
          <h2>7. Contact</h2>
          <p>For privacy enquiries: <a href="mailto:hello@workspeakportugal.com">hello@workspeakportugal.com</a></p>
        </div>
      </div>
    </div>
  )
}
