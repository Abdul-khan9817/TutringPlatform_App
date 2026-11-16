import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Professional Portuguese & English Lessons in Portugal',
  description:
    'Speak Portuguese. Grow your career. Feel at home in Portugal. Professional language lessons for workers, professionals, and international communities.',
}

function PortugalFlagIcon() {
  return (
    <svg className="h-6 w-8 rounded shadow-sm overflow-hidden flex-shrink-0" viewBox="0 0 600 400" aria-hidden="true">
      <rect width="240" height="400" fill="#046A38" />
      <rect x="240" width="360" height="400" fill="#DA291C" />
      <circle cx="240" cy="200" r="80" fill="#FFE900" />
      <circle cx="240" cy="200" r="50" fill="#DA291C" />
      <circle cx="240" cy="200" r="30" fill="#FFFFFF" />
    </svg>
  )
}

function UKFlagIcon() {
  return (
    <svg className="h-6 w-8 rounded shadow-sm overflow-hidden flex-shrink-0" viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id="uk-flag-clip"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="uk-flag-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#uk-flag-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-flag-diag)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  )
}

function PricingIcon() {
  return (
    <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    </div>
  )
}

function AssessmentIcon() {
  return (
    <div className="h-7 w-7 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-600 flex-shrink-0">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H5z" />
      </svg>
    </div>
  )
}

function ContactIcon() {
  return (
    <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
  )
}

const quickNavCards = [
  {
    href: '/portuguese',
    title: 'Portuguese',
    desc: 'General, workplace & daily life Portuguese from A1 to C1.',
    renderIcon: PortugalFlagIcon,
    badge: 'Popular',
    cta: 'View Lessons',
  },
  {
    href: '/english',
    title: 'English',
    desc: 'Business communication, presentations & career skills.',
    renderIcon: UKFlagIcon,
    badge: 'Career',
    cta: 'Explore English',
  },
  {
    href: '/pricing',
    title: 'Pricing',
    desc: 'Transparent individual lesson & discount package rates.',
    renderIcon: PricingIcon,
    badge: 'In EUR',
    cta: 'See Rates',
  },
  {
    href: '/assessment',
    title: 'Free Assessment',
    desc: '15-min conversational assessment with no commitment.',
    renderIcon: AssessmentIcon,
    badge: '100% Free',
    cta: 'Book Now',
  },
  {
    href: '/contact',
    title: 'Contact',
    desc: 'WhatsApp & email enquiries for individuals & corporate teams.',
    renderIcon: ContactIcon,
    badge: 'Fast Reply',
    cta: 'Get in Touch',
  },
]

const howItWorks = [
  {
    step: '1',
    title: 'Book a Free Assessment',
    description:
      'Start with a complimentary 15-minute assessment. We evaluate your current level, discuss your goals, and recommend the right programme.',
  },
  {
    step: '2',
    title: 'Get Your Learning Plan',
    description:
      'Receive a personalised learning plan designed around your schedule, goals, and preferred style of learning.',
  },
  {
    step: '3',
    title: 'Start Learning',
    description:
      'Begin lessons online or in-person. Track your progress, complete homework, and access learning materials anytime.',
  },
]

const benefits = [
  {
    icon: '🎯',
    title: 'Goal-Focused Learning',
    description:
      'Every lesson is built around your specific goals — whether for work, daily life, or professional advancement.',
  },
  {
    icon: '📱',
    title: 'Online & In-Person',
    description:
      'Choose the format that works for you. Flexible online lessons or face-to-face sessions in Portugal.',
  },
  {
    icon: '📦',
    title: 'Lesson Packages',
    description:
      'Save with multi-lesson packages. Flexible packages for individuals and corporate teams.',
  },
  {
    icon: '🏢',
    title: 'Corporate Training',
    description:
      "Customised language programmes for companies. Improve your team's communication and professional effectiveness.",
  },
  {
    icon: '📊',
    title: 'Track Your Progress',
    description:
      'Follow your learning journey through your student dashboard. View completed lessons, progress milestones, and tutor feedback.',
  },
  {
    icon: '🤝',
    title: 'Qualified Tutor',
    description:
      'Work with an experienced, qualified language professional dedicated to your progress.',
  },
]

const faqs = [
  {
    q: 'Do I need any prior knowledge of Portuguese to start?',
    a: 'Not at all. We offer lessons from complete beginner level (A1) through to advanced. Your free assessment determines the right starting point.',
  },
  {
    q: 'Are lessons available online?',
    a: 'Yes. We offer both online and in-person lessons. Online lessons are conducted via video call and are equally effective as face-to-face sessions.',
  },
  {
    q: 'How long are the lessons?',
    a: 'Standard individual lessons are 60 minutes. We also offer other durations depending on your needs and the service selected.',
  },
  {
    q: 'Can my company arrange lessons for employees?',
    a: 'Yes. We offer corporate language training for teams and businesses. Contact us to discuss a customised programme.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards through our secure Stripe-powered checkout. Payments are made in EUR.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Please review our Terms & Conditions for the full cancellation policy. Bookings can be cancelled through your student dashboard.',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          aria-hidden="true"
        />
        {/* Thin tricolor accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400 opacity-60" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-36">
          <div className="max-w-3xl">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-brand-100 mb-7 border border-white/20 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
              Now Accepting New Students
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-balance mb-7">
              Speak Portuguese.<br />
              Grow Your Career.<br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">
                Feel at Home in Portugal.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-brand-100/90 leading-relaxed mb-10 max-w-2xl">
              Practical Portuguese and English lessons designed for workers,
              professionals, and international communities in Portugal.
              <strong className="text-white font-semibold"> Real language for real life.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/assessment">
                <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 shadow-xl shadow-black/20 w-full sm:w-auto font-bold">
                  Book Your Free Assessment
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 w-full sm:w-auto backdrop-blur-sm">
                  Explore Our Lessons
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-5 text-sm">
              {[
                { label: '100% Free Assessment' },
                { label: 'No Commitment' },
                { label: 'Online & In-Person' },
                { label: 'EUR Pricing' },
              ].map((b) => (
                <span key={b.label} className="group flex items-center gap-2 text-brand-200 hover:text-white transition-colors cursor-default">
                  <svg className="h-4 w-4 text-green-400 group-hover:scale-125 transition-transform flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{b.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Navigation Cards ── */}
      <section className="py-14 bg-white border-b border-slate-100" aria-label="Explore WorkSpeak sections">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Everything You Need</h2>
            <p className="text-slate-500 text-sm sm:text-base">Lessons, pricing, free assessment — all in one place</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickNavCards.map((c) => {
              const Icon = c.renderIcon
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-brand-400 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle hover background tint */}
                  <div className="absolute inset-0 bg-brand-50/0 group-hover:bg-brand-50/40 transition-colors duration-200 rounded-2xl pointer-events-none" aria-hidden="true" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                        <Icon />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-200/50">
                        {c.badge}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-1.5 group-hover:text-brand-700 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                  <div className="relative mt-5 pt-3 border-t border-slate-100 group-hover:border-brand-100 transition-colors flex items-center justify-between text-xs font-bold text-brand-600">
                    <span>{c.cta}</span>
                    <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Language cards ── */}
      <section className="section bg-slate-50" aria-labelledby="services-heading">
        <div className="container-wide">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">Our Languages</span>
            <h2 id="services-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              What We Teach
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional language lessons tailored to your life and career in Portugal.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Portuguese */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-200 relative overflow-hidden cursor-default">
              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 group-hover:bg-emerald-100/60 transition-all duration-200">
                    <PortugalFlagIcon />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">A1 — C1+</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-emerald-800 transition-colors">Portuguese Lessons</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  From beginner to advanced — practical Portuguese for everyday communication,
                  the workplace, and professional life in Portugal.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {['A1–B2 and beyond', 'Workplace communication', 'Everyday Portuguese', 'Speaking & listening focus'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700 group/li hover:translate-x-1 hover:text-slate-950 transition-all duration-150">
                      <span className="h-5 w-5 rounded-full bg-emerald-100 group-hover/li:bg-emerald-200 flex items-center justify-center flex-shrink-0 transition-colors duration-150" aria-hidden="true">
                        <svg className="h-3 w-3 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/portuguese">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold">View Portuguese Lessons →</Button>
                </Link>
              </div>
            </div>

            {/* English */}
            <div className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-sky-400 hover:shadow-xl transition-all duration-200 relative overflow-hidden cursor-default">
              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 group-hover:scale-105 group-hover:bg-sky-100/60 transition-all duration-200">
                    <UKFlagIcon />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">All Levels</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-sky-800 transition-colors">English Lessons</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Professional English for career advancement — business communication,
                  presentations, meetings, and workplace confidence.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {['Business & workplace English', 'Presentations & meetings', 'Email writing', 'Interview preparation'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700 group/li hover:translate-x-1 hover:text-slate-950 transition-all duration-150">
                      <span className="h-5 w-5 rounded-full bg-sky-100 group-hover/li:bg-sky-200 flex items-center justify-center flex-shrink-0 transition-colors duration-150" aria-hidden="true">
                        <svg className="h-3 w-3 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/english">
                  <Button className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold">View English Lessons →</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Delivery modes ── */}
      <section className="section bg-white" aria-labelledby="modes-heading">
        <div className="container-wide">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">Flexible Delivery</span>
            <h2 id="modes-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Online & In-Person
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Learn your way. Both formats offer the same quality, the same tutor, and the same outcomes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="group rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 hover:shadow-xl hover:border-brand-400 transition-all duration-200 cursor-default">
              <div className="h-14 w-14 rounded-2xl bg-brand-700 flex items-center justify-center mb-5 shadow-md shadow-brand-700/20 group-hover:bg-brand-800 transition-colors duration-200">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-brand-700 transition-colors">Online Lessons</h3>
              <p className="text-slate-600 leading-relaxed">
                Lessons via video call from wherever you are. Flexible, convenient, and just as effective as in-person. Perfect for busy professionals and remote workers.
              </p>
            </div>
            <div className="group rounded-3xl border-2 border-slate-200 bg-white p-8 hover:shadow-xl hover:border-brand-300 transition-all duration-200 cursor-default">
              <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-5 shadow-md shadow-brand-600/20 group-hover:bg-brand-700 transition-colors duration-200">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-brand-700 transition-colors">In-Person Lessons</h3>
              <p className="text-slate-600 leading-relaxed">
                Face-to-face lessons in Portugal. Ideal for learners who prefer a more immersive, hands-on experience with direct interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section bg-slate-50" aria-labelledby="how-heading">
        <div className="container-wide">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">Simple Process</span>
            <h2 id="how-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">Simple, straightforward, and focused on your progress.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-500 to-brand-200" aria-hidden="true" />
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="text-center relative group rounded-2xl p-6 bg-white border border-slate-200 hover:border-brand-400 hover:shadow-lg transition-all duration-200 cursor-default"
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white text-2xl font-extrabold mb-6 shadow-xl shadow-brand-700/30 relative z-10 group-hover:scale-105 transition-transform duration-200" aria-hidden="true">
                  {step.step}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-3 group-hover:text-brand-700 transition-colors">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href="/assessment">
              <Button size="lg">Start with a Free Assessment →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="section bg-white" aria-labelledby="benefits-heading">
        <div className="container-wide">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">Why Choose Us</span>
            <h2 id="benefits-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Why WorkSpeak Portugal?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to learn a language effectively and confidently.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-400 hover:shadow-lg transition-all duration-200 cursor-default"
              >
                <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors duration-200">
                  <span className="text-2xl" aria-hidden="true">{b.icon}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">{b.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Corporate CTA ── */}
      <section className="section bg-gradient-to-br from-brand-50/70 via-white to-blue-50/60 border-y border-slate-200" aria-labelledby="corporate-heading">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 hover:border-brand-300 hover:shadow-xl transition-all duration-200">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-800 mb-6 border border-brand-200 shadow-xs">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              For Businesses & Teams
            </div>
            <h2 id="corporate-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
              Corporate Language Training
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Equip your team with the language skills they need to work effectively in Portugal. Customised group and individual training programmes for businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-brand-700 hover:bg-brand-800 text-white shadow-md w-full sm:w-auto font-bold">
                  Enquire About Corporate Training
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Packages teaser ── */}
      <section className="section bg-slate-50" aria-labelledby="packages-heading">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 id="packages-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Flexible Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Individual lessons and lesson packages available. Save more with a package.
            </p>
          </div>
          <div className="text-center">
            <Link href="/pricing">
              <Button size="lg" variant="secondary">View Pricing & Packages</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ — interactive accordion ── */}
      <section className="section bg-white" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">Everything you need to know before getting started.</p>
          </div>
          <div className="space-y-3.5">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 hover:border-brand-300 hover:shadow-md"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-4 font-bold text-slate-900 select-none hover:bg-brand-50/40 group-open:bg-brand-50/60 transition-colors list-none">
                  <span className="group-hover:text-brand-700 transition-colors text-base">{faq.q}</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-brand-100 group-open:bg-brand-700 group-open:text-white flex items-center justify-center text-slate-500 transition-colors flex-shrink-0">
                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="px-6 pb-5 pt-2 border-t border-slate-100 group-open:border-brand-100/50">
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="section bg-gradient-to-br from-brand-800 to-brand-600 text-white" aria-labelledby="cta-heading">
        <div className="container-wide text-center">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
            Book your free 15-minute assessment today. No commitment. Just a conversation about your goals.
          </p>
          <Link href="/assessment">
            <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 shadow-lg">
              Book Your Free Assessment
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
