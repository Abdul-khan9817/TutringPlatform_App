import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Portuguese Lessons for Workers & Professionals',
  description: 'Practical Portuguese lessons from beginner to advanced. Designed for foreigners living and working in Portugal. Online and in-person options available.',
}

const levels = [
  { code: 'A1', name: 'Beginner', desc: 'Zero knowledge? No problem. Build a foundation from scratch — greetings, numbers, everyday phrases, and basic conversations.' },
  { code: 'A2', name: 'Elementary', desc: 'You can say a few things but struggle with real conversations. Expand your vocabulary and start speaking confidently in common situations.' },
  { code: 'B1', name: 'Intermediate', desc: 'Hold basic conversations but still hit walls at work or in formal settings. Develop fluency for the workplace and daily life.' },
  { code: 'B2', name: 'Upper Intermediate', desc: 'Communicate well but want more precision and confidence. Refine your grammar, expand professional vocabulary, and reduce errors.' },
  { code: 'C1+', name: 'Advanced', desc: 'Near-native precision, complex professional communication, and nuanced expression for senior professional or academic contexts.' },
]

const topics = [
  'Workplace communication', 'Meetings and presentations', 'Email and written Portuguese',
  'Phone and video call skills', 'Dealing with bureaucracy', 'Shopping and services',
  'Medical and emergency situations', 'Social conversations', 'Portuguese pronunciation',
  'Grammar in context', 'Reading and writing', 'Listening comprehension',
]

export default function PortuguesePage() {
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
              <span className="text-2xl" aria-hidden="true">🇵🇹</span>
              All levels · Online & In-Person
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-balance">Portuguese Lessons</h1>
            <p className="text-lg text-brand-100 leading-relaxed mb-8 max-w-2xl">
              Practical, goal-focused Portuguese lessons for foreigners living and working in Portugal.
              From complete beginner to advanced — learn the language you actually need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/assessment">
                <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 shadow-lg w-full sm:w-auto">
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

      {/* Levels */}
      <section className="section">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">All Levels Covered</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you are a complete beginner or already conversational, we have the right programme for you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((l) => (
              <div
                key={l.code}
                className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-emerald-400 hover:shadow-xl transition-all duration-200 cursor-default"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold text-sm flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:shadow-md group-hover:shadow-emerald-600/30 transition-all duration-200">
                    {l.code}
                  </span>
                  <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-base">{l.name}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section bg-slate-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">What We Cover</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Real-world topics designed for life and work in Portugal.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((t) => (
              <div
                key={t}
                className="group flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-5 py-3.5 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/40 transition-all duration-200 cursor-default"
              >
                <span className="h-2 w-2 rounded-full bg-brand-600 group-hover:bg-emerald-500 group-hover:scale-125 transition-all duration-200 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-950 transition-colors">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-brand-800 to-brand-600 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Start Speaking Portuguese?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Book a free 15-minute assessment and we will find the right level and programme for you.
          </p>
          <Link href="/assessment">
            <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 shadow-lg">
              Book Free Assessment
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
