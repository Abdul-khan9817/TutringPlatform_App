import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'English Lessons for Professionals in Portugal',
  description: 'Professional English lessons for career advancement. Business communication, presentations, meetings and workplace English. Online and in-person in Portugal.',
}

const programmes = [
  { title: 'Workplace English', desc: 'Communicate confidently with colleagues, clients, and management. Covers meetings, emails, reports, and professional vocabulary.' },
  { title: 'Business Communication', desc: 'Write and speak like a professional. Formal writing, business etiquette, negotiation language, and cross-cultural communication.' },
  { title: 'Presentations & Meetings', desc: 'Structure and deliver clear presentations. Participate effectively in meetings, ask questions, and express opinions professionally.' },
  { title: 'Email Writing', desc: 'Write clear, professional emails in English. Appropriate tone, structure, and vocabulary for business correspondence.' },
  { title: 'Interview Preparation', desc: 'Prepare for job interviews in English. Common questions, structured answers, vocabulary, and confidence-building practice.' },
  { title: 'General English', desc: 'Improve overall English fluency for everyday situations, travel, socialising, and professional life outside the office.' },
]

const audience = [
  'Portuguese professionals who work with international companies or clients',
  'Employees who need to attend or lead meetings in English',
  'Professionals preparing for a job interview or promotion',
  'Anyone living in Portugal who needs English for daily life and work',
  'Teams requiring language training as part of corporate development',
]

export default function EnglishPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          aria-hidden="true"
        />
        <div className="container-wide relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-100 mb-5 border border-white/20">
              <span className="text-2xl" aria-hidden="true">🇬🇧</span>
              All levels · Online & In-Person
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-balance">English Lessons</h1>
            <p className="text-lg text-brand-100 leading-relaxed mb-8 max-w-2xl">
              Professional English for career advancement in Portugal and beyond. Lessons designed for working professionals who need to communicate clearly and confidently in English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/assessment">
                <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 shadow-lg w-full sm:w-auto font-bold">
                  Start with a Free Assessment
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="section">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Our English Programmes</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Targeted programmes built around real professional needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-sky-400 hover:shadow-xl transition-all duration-200 cursor-default"
              >
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors text-lg">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className="section bg-slate-50">
        <div className="container-wide max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Who Is This For?</h2>
            <p className="text-lg text-slate-600">These lessons are ideal for a wide range of professionals.</p>
          </div>
          <div className="space-y-3">
            {audience.map((item) => (
              <div
                key={item}
                className="group flex items-start gap-4 rounded-xl bg-white border border-slate-200 px-5 py-4 hover:border-sky-400 hover:shadow-md hover:bg-sky-50/40 transition-all duration-200 cursor-default"
              >
                <span className="mt-0.5 h-6 w-6 rounded-full bg-brand-100 group-hover:bg-sky-600 flex items-center justify-center flex-shrink-0 transition-colors duration-200" aria-hidden="true">
                  <svg className="h-3.5 w-3.5 text-brand-700 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-950 transition-colors">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-brand-800 to-brand-600 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-extrabold mb-4">Advance Your Career with Better English</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Start with a free assessment and get a programme built around your specific goals.
          </p>
          <Link href="/assessment">
            <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 shadow-lg font-bold">
              Book Free Assessment
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
