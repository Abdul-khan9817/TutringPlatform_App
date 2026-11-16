import type { Metadata } from 'next'
import { AssessmentForm } from './assessment-form'

export const metadata: Metadata = {
  title: 'Book a Free 15-Minute Assessment | WorkSpeak Portugal',
  description:
    'Start with a free 15-minute language level assessment. Tell us your goals and we will design the right programme for you.',
}

const steps = [
  {
    step: '1',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Fill the Form',
    desc: 'Takes less than 2 minutes',
  },
  {
    step: '2',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'We Get in Touch',
    desc: 'Within 1 business day',
  },
  {
    step: '3',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Free Video Call',
    desc: '15-min conversational assessment',
  },
]

export default function AssessmentPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          aria-hidden="true"
        />

        <div className="relative container-wide py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/15 border border-green-400/30 px-4 py-1.5 text-sm font-semibold text-green-300 mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            100% Free — No Commitment Required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-balance leading-tight">
            Book Your{' '}
            <span className="text-amber-300">Free Assessment</span>
          </h1>

          <p className="text-brand-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            A free 15-minute conversation where we assess your current level, understand your
            goals, and recommend the perfect programme for you.
          </p>

          {/* Trust stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm">
            {[
              { value: '15 min', label: 'Video call' },
              { value: '1 day', label: 'Response time' },
              { value: '0 €', label: 'Cost' },
              { value: 'No', label: 'Commitment' },
            ].map((stat) => (
              <div key={stat.label} className="group text-center hover:scale-110 transition-transform duration-200 cursor-default">
                <div className="text-2xl font-extrabold text-white group-hover:text-amber-300 transition-colors">{stat.value}</div>
                <div className="text-brand-200 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps strip ── */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="container-wide">
          <div className="relative max-w-2xl mx-auto">
            {/* Connector line (desktop) */}
            <div className="hidden sm:block absolute top-7 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" aria-hidden="true" />

            <div className="grid sm:grid-cols-3 gap-6 text-center relative">
              {steps.map((s) => (
                <div key={s.step} className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-default">
                  <div className="relative z-10 h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-0.5">Step {s.step}</div>
                    <p className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors text-sm">{s.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {/* Form card header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Tell Us About Your Goals</h2>
            <p className="text-slate-500 text-sm">Fill in a few details and we will be in touch within one business day.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-100 p-6 sm:p-8 hover:shadow-xl hover:border-slate-300 transition-all duration-300">
            <AssessmentForm />
          </div>

          {/* Reassurance row */}
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-slate-400">
            {[
              '🔒 Your data is kept private',
              '📧 Confirmation sent by email',
              '✅ No credit card required',
            ].map((item) => (
              <span key={item} className="hover:text-slate-600 hover:scale-105 transition-all duration-150 cursor-default">{item}</span>
            ))}
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            By submitting, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>.
            We will never share your information.
          </p>
        </div>
      </section>
    </div>
  )
}
