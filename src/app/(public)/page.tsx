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
    <svg
      className="h-6 w-8 flex-shrink-0 overflow-hidden rounded shadow-sm"
      viewBox="0 0 600 400"
      aria-hidden="true"
    >
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
    <svg
      className="h-6 w-8 flex-shrink-0 overflow-hidden rounded shadow-sm"
      viewBox="0 0 60 30"
      aria-hidden="true"
    >
      <clipPath id="uk-flag-clip">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="uk-flag-diag">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#uk-flag-diag)"
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

function PricingIcon() {
  return (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    </div>
  )
}

function AssessmentIcon() {
  return (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-600">
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2H5z"
        />
      </svg>
    </div>
  )
}

function ContactIcon() {
  return (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
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
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />
        {/* Thin tricolor accent at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-red-500 to-amber-400 opacity-60"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            {/* Live badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-brand-100 backdrop-blur-sm">
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-green-400"
                aria-hidden="true"
              />
              Now Accepting New Students
            </div>

            <h1 className="mb-7 text-balance text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Speak Portuguese.
              <br />
              Grow Your Career.
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">
                Feel at Home in Portugal.
              </span>
            </h1>

            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-brand-100/90 sm:text-xl">
              Practical Portuguese and English lessons designed for workers, professionals, and
              international communities in Portugal.
              <strong className="font-semibold text-white"> Real language for real life.</strong>
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/assessment">
                <Button
                  size="lg"
                  className="w-full bg-white font-bold text-brand-800 shadow-xl shadow-black/20 hover:bg-brand-50 sm:w-auto"
                >
                  Book Your Free Assessment
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/40 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/10 sm:w-auto"
                >
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
                <span
                  key={b.label}
                  className="group flex cursor-default items-center gap-2 text-brand-200 transition-colors hover:text-white"
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-green-400 transition-transform group-hover:scale-125"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{b.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Navigation Cards ── */}
      <section
        className="border-b border-slate-100 bg-white py-14"
        aria-label="Explore WorkSpeak sections"
      >
        <div className="container-wide">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Everything You Need
            </h2>
            <p className="text-sm text-slate-500 sm:text-base">
              Lessons, pricing, free assessment — all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {quickNavCards.map((c) => {
              const Icon = c.renderIcon
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-brand-400 hover:shadow-lg"
                >
                  {/* Subtle hover background tint */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-brand-50/0 transition-colors duration-200 group-hover:bg-brand-50/40"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 transition-colors group-hover:border-brand-100 group-hover:bg-brand-50">
                        <Icon />
                      </div>
                      <span className="rounded-full border border-brand-200/50 bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                        {c.badge}
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-base font-extrabold text-slate-900 transition-colors group-hover:text-brand-700">
                      {c.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-500">{c.desc}</p>
                  </div>
                  <div className="relative mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-brand-600 transition-colors group-hover:border-brand-100">
                    <span>{c.cta}</span>
                    <svg
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
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
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-brand-600">
              Our Languages
            </span>
            <h2
              id="services-heading"
              className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            >
              What We Teach
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Professional language lessons tailored to your life and career in Portugal.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Portuguese */}
            <div className="group relative cursor-default overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:border-emerald-400 hover:shadow-xl">
              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-100/60">
                    <PortugalFlagIcon />
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
                    A1 — C1+
                  </span>
                </div>
                <h3 className="mb-3 text-2xl font-extrabold text-slate-900 transition-colors group-hover:text-emerald-800">
                  Portuguese Lessons
                </h3>
                <p className="mb-6 leading-relaxed text-slate-600">
                  From beginner to advanced — practical Portuguese for everyday communication, the
                  workplace, and professional life in Portugal.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {[
                    'A1–B2 and beyond',
                    'Workplace communication',
                    'Everyday Portuguese',
                    'Speaking & listening focus',
                  ].map((item) => (
                    <li
                      key={item}
                      className="group/li flex items-center gap-2.5 text-sm text-slate-700 transition-all duration-150 hover:translate-x-1 hover:text-slate-950"
                    >
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 transition-colors duration-150 group-hover/li:bg-emerald-200"
                        aria-hidden="true"
                      >
                        <svg
                          className="h-3 w-3 text-emerald-700"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/portuguese">
                  <Button className="w-full bg-emerald-700 font-bold text-white hover:bg-emerald-800">
                    View Portuguese Lessons →
                  </Button>
                </Link>
              </div>
            </div>

            {/* English */}
            <div className="group relative cursor-default overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:border-sky-400 hover:shadow-xl">
              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 transition-all duration-200 group-hover:scale-105 group-hover:bg-sky-100/60">
                    <UKFlagIcon />
                  </div>
                  <span className="rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-sky-700">
                    All Levels
                  </span>
                </div>
                <h3 className="mb-3 text-2xl font-extrabold text-slate-900 transition-colors group-hover:text-sky-800">
                  English Lessons
                </h3>
                <p className="mb-6 leading-relaxed text-slate-600">
                  Professional English for career advancement — business communication,
                  presentations, meetings, and workplace confidence.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {[
                    'Business & workplace English',
                    'Presentations & meetings',
                    'Email writing',
                    'Interview preparation',
                  ].map((item) => (
                    <li
                      key={item}
                      className="group/li flex items-center gap-2.5 text-sm text-slate-700 transition-all duration-150 hover:translate-x-1 hover:text-slate-950"
                    >
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 transition-colors duration-150 group-hover/li:bg-sky-200"
                        aria-hidden="true"
                      >
                        <svg
                          className="h-3 w-3 text-sky-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/english">
                  <Button className="w-full bg-sky-700 font-bold text-white hover:bg-sky-800">
                    View English Lessons →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Delivery modes ── */}
      <section className="section bg-white" aria-labelledby="modes-heading">
        <div className="container-wide">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-brand-600">
              Flexible Delivery
            </span>
            <h2
              id="modes-heading"
              className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            >
              Online & In-Person
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Learn your way. Both formats offer the same quality, the same tutor, and the same
              outcomes.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="group cursor-default rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 transition-all duration-200 hover:border-brand-400 hover:shadow-xl">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 shadow-md shadow-brand-700/20 transition-colors duration-200 group-hover:bg-brand-800">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-extrabold text-slate-900 transition-colors group-hover:text-brand-700">
                Online Lessons
              </h3>
              <p className="leading-relaxed text-slate-600">
                Lessons via video call from wherever you are. Flexible, convenient, and just as
                effective as in-person. Perfect for busy professionals and remote workers.
              </p>
            </div>
            <div className="group cursor-default rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all duration-200 hover:border-brand-300 hover:shadow-xl">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-md shadow-brand-600/20 transition-colors duration-200 group-hover:bg-brand-700">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-extrabold text-slate-900 transition-colors group-hover:text-brand-700">
                In-Person Lessons
              </h3>
              <p className="leading-relaxed text-slate-600">
                Face-to-face lessons in Portugal. Ideal for learners who prefer a more immersive,
                hands-on experience with direct interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section bg-slate-50" aria-labelledby="how-heading">
        <div className="container-wide">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-brand-600">
              Simple Process
            </span>
            <h2
              id="how-heading"
              className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            >
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Simple, straightforward, and focused on your progress.
            </p>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line (desktop only) */}
            <div
              className="absolute left-[20%] right-[20%] top-8 hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-500 to-brand-200 md:block"
              aria-hidden="true"
            />
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="group relative cursor-default rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-200 hover:border-brand-400 hover:shadow-lg"
              >
                <div
                  className="relative z-10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-2xl font-extrabold text-white shadow-xl shadow-brand-700/30 transition-transform duration-200 group-hover:scale-105"
                  aria-hidden="true"
                >
                  {step.step}
                </div>
                <h3 className="mb-3 text-lg font-extrabold text-slate-900 transition-colors group-hover:text-brand-700">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
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
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-brand-600">
              Why Choose Us
            </span>
            <h2
              id="benefits-heading"
              className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            >
              Why WorkSpeak Portugal?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Everything you need to learn a language effectively and confidently.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group cursor-default rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-brand-400 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 transition-colors duration-200 group-hover:bg-brand-100">
                  <span className="text-2xl" aria-hidden="true">
                    {b.icon}
                  </span>
                </div>
                <h3 className="mb-2 font-extrabold text-slate-900 transition-colors group-hover:text-brand-700">
                  {b.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Corporate CTA ── */}
      <section
        className="section border-y border-slate-200 bg-gradient-to-br from-brand-50/70 via-white to-blue-50/60"
        aria-labelledby="corporate-heading"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center transition-all duration-200 hover:border-brand-300 hover:shadow-xl sm:p-12">
            <div className="shadow-xs mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-800">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              For Businesses & Teams
            </div>
            <h2
              id="corporate-heading"
              className="mb-6 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            >
              Corporate Language Training
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-slate-600">
              Equip your team with the language skills they need to work effectively in Portugal.
              Customised group and individual training programmes for businesses.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="w-full bg-brand-700 font-bold text-white shadow-md hover:bg-brand-800 sm:w-auto"
                >
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
          <div className="mb-14 text-center">
            <h2
              id="packages-heading"
              className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            >
              Flexible Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Individual lessons and lesson packages available. Save more with a package.
            </p>
          </div>
          <div className="text-center">
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                View Pricing & Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ — interactive accordion ── */}
      <section className="section bg-white" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2
              id="faq-heading"
              className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know before getting started.
            </p>
          </div>
          <div className="space-y-3.5">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-brand-300 hover:shadow-md"
              >
                <summary className="flex cursor-pointer select-none list-none items-center justify-between gap-4 px-6 py-4 font-bold text-slate-900 transition-colors hover:bg-brand-50/40 group-open:bg-brand-50/60">
                  <span className="text-base transition-colors group-hover:text-brand-700">
                    {faq.q}
                  </span>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-open:bg-brand-700 group-open:text-white group-hover:bg-brand-100">
                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </summary>
                <div className="border-t border-slate-100 px-6 pb-5 pt-2 group-open:border-brand-100/50">
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="section bg-gradient-to-br from-brand-800 to-brand-600 text-white"
        aria-labelledby="cta-heading"
      >
        <div className="container-wide text-center">
          <h2 id="cta-heading" className="mb-4 text-3xl font-extrabold sm:text-4xl">
            Ready to Start Learning?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-brand-100">
            Book your free 15-minute assessment today. No commitment. Just a conversation about your
            goals.
          </p>
          <Link href="/assessment">
            <Button size="lg" className="bg-white text-brand-800 shadow-lg hover:bg-brand-50">
              Book Your Free Assessment
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
