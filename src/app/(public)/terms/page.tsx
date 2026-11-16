import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Terms & Conditions' }

export default function TermsPage() {
  return (
    <div className="section">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms &amp; Conditions</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().getFullYear()}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> These terms must be reviewed and approved by a qualified legal professional before this platform accepts live bookings or payments.
          </p>
        </div>
        <div className="legal-prose">
          <h2>1. Services</h2>
          <p>WorkSpeak Portugal provides professional language tutoring services as described on this platform.</p>
          <h2>2. Bookings</h2>
          <p>Bookings are confirmed upon receipt of full payment. The platform will send a confirmation to your registered email.</p>
          <h2>3. Cancellation Policy</h2>
          <p>Cancellation terms will be defined and displayed here before accepting live bookings. Please contact us for current cancellation terms.</p>
          <h2>4. Payments</h2>
          <p>All payments are processed in EUR via Stripe. Prices displayed include applicable taxes. We do not store payment card details.</p>
          <h2>5. Packages</h2>
          <p>Lesson packages are valid for the stated number of days from purchase. Unused lessons do not carry over beyond the validity period.</p>
          <h2>6. Conduct</h2>
          <p>Students are expected to treat tutors with respect. WorkSpeak Portugal reserves the right to terminate access to any user who breaches these terms.</p>
          <h2>7. Governing Law</h2>
          <p>These terms are governed by the laws of Portugal.</p>
        </div>
      </div>
    </div>
  )
}
