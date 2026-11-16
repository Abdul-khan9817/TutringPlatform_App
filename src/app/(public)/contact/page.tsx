import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with WorkSpeak Portugal. Book a lesson, ask a question, or enquire about corporate language training.',
}

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? '+351 916 869 857'
  const phone = whatsapp.replace(/\D/g, '')

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-16 md:py-20">
        <div className="container-wide text-center">
          <h1 className="text-4xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-lg text-brand-100 max-w-xl mx-auto">
            Have a question? Want to book a lesson? We are here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="section">
        <div className="container-wide max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {/* Left column */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-5 text-lg">Get In Touch</h2>
                <div className="space-y-4">
                  {phone && (
                    <a
                      href={`https://wa.me/${phone}?text=${encodeURIComponent('Hello! I am interested in language lessons at WorkSpeak Portugal.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="h-11 w-11 rounded-xl bg-emerald-100 border border-emerald-200/80 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:bg-emerald-200 transition-colors duration-200">
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">WhatsApp</p>
                        <p className="text-xs font-medium text-emerald-700">{whatsapp} — fastest response</p>
                      </div>
                      <svg className="h-4 w-4 text-emerald-600 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                  <a
                    href="mailto:hello@workspeakportugal.com"
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50/60 hover:border-sky-300 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    <div className="h-11 w-11 rounded-xl bg-sky-100 border border-sky-200/80 flex items-center justify-center text-sky-600 flex-shrink-0 group-hover:bg-sky-200 transition-colors duration-200">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-sky-950 transition-colors">Email</p>
                      <span className="text-xs text-slate-600 group-hover:text-sky-700 transition-colors">
                        hello@workspeakportugal.com
                      </span>
                    </div>
                    <svg className="h-4 w-4 text-sky-600 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50/40 hover:border-amber-300 hover:shadow-md transition-all duration-200 group cursor-default">
                    <div className="h-11 w-11 rounded-xl bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-700 flex-shrink-0 group-hover:bg-amber-200 transition-colors duration-200">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-amber-950 transition-colors">Response Time</p>
                      <p className="text-xs text-slate-600">We aim to respond within 1 business day</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brand-200 bg-brand-50/80 p-6 hover:border-brand-400 hover:shadow-xl transition-all duration-200">
                <h2 className="font-bold text-brand-900 mb-2 text-lg">Start with a Free Assessment</h2>
                <p className="text-sm text-brand-700 mb-5 leading-relaxed">The fastest way to get started. Book your free 15-minute assessment and we will be in touch within one business day.</p>
                <Link href="/assessment">
                  <Button className="w-full font-bold">Book Free Assessment</Button>
                </Link>
              </div>
            </div>

            {/* Right column */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-xl transition-all duration-200">
              <h2 className="font-bold text-slate-900 mb-6 text-lg">Corporate Training Enquiry</h2>
              <CorporateForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CorporateForm() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Looking for group or corporate language training? Fill in this form and we will get back to you.
      </p>
      <div className="rounded-xl bg-brand-50 border border-brand-200/80 p-4 text-sm text-brand-900 leading-relaxed flex items-start gap-3 hover:border-brand-300 hover:shadow-xs transition-all duration-200">
        <div className="h-8 w-8 rounded-lg bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 flex-shrink-0 mt-0.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-700 text-xs sm:text-sm">
          Use the assessment form for individual enquiries, or contact us directly via WhatsApp for the fastest response.
        </p>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 hover:border-brand-300 hover:shadow-xs transition-all duration-200">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">What to include in your enquiry:</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {[
              'Number of employees / team size',
              'Language needed (Portuguese or English)',
              'Current level and goals',
              'Preferred format (online or in-person)',
              'Your budget or timeline',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 group hover:translate-x-1 hover:text-slate-900 transition-all duration-150 cursor-default">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 group-hover:scale-125 group-hover:bg-brand-700 transition-all flex-shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link href="/assessment">
        <Button variant="secondary" className="w-full">Go to Assessment Form</Button>
      </Link>
    </div>
  )
}
