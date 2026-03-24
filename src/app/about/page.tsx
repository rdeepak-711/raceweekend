import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { SITE_URL, BASE_OG } from '@/lib/constants/site';

export const metadata: Metadata = {
  title: 'About | Race Weekend',
  description: 'Race Weekend sits at the intersection of motorsport and travel. We believe a Grand Prix trip should be more than just the race.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: { ...BASE_OG,title: 'About Race Weekend',
    description: 'A race weekend is not just a race. Race Weekend helps fans turn a trip to a Grand Prix into a proper travel experience.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Deepak',
  jobTitle: 'Founder',
  url: `${SITE_URL}/about`,
  worksFor: { '@type': 'Organization', name: 'Race Weekend' },
  knowsAbout: ['Formula 1', 'MotoGP', 'Race Travel', 'Motorsport', 'Grand Prix Travel', 'Circuit Tourism'],
  description: 'F1 and MotoGP fan who has attended races across Europe and Asia. Founder of Race Weekend, a travel planning platform for motorsport fans.',
};

export default async function AboutPage() {
  await headers();
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
    <div className="min-h-screen pt-20 pb-24 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto">

        <div className="py-16">
          {/* Eyebrow */}
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-6">
            About Race Weekend
          </p>

          <h1 className="font-display font-black text-5xl md:text-7xl text-white uppercase italic tracking-tighter leading-none mb-8">
            Built for fans.<br />
            <span className="text-[var(--accent-teal)]">By a fan.</span>
          </h1>

          <div className="space-y-6 text-[var(--text-secondary)] text-lg leading-relaxed mb-16">
            <p>
              A race weekend is not just a race. It&apos;s a city you&apos;ve never explored, a culture you haven&apos;t tasted,
              and three days of stories that have nothing to do with lap times.
            </p>
            <p>
              Race Weekend exists to make sure fans don&apos;t miss that part.
            </p>
            <p>
              We sit at the intersection of motorsport and travel — pulling together session schedules, curated local
              experiences, event tickets, and practical city guides into one place. The goal is simple: turn a trip to
              a Grand Prix into a proper travel experience, not just a checkbox.
            </p>
          </div>

          {/* Author expertise */}
          <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] mb-16">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--text-tertiary)] mb-3">The Person Behind It</p>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">Why I Built This</h2>
            <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
              <p>
                I&apos;m Deepak — a software engineer and long-time F1 and MotoGP fan who has attended races across Europe and Asia.
                From the chaos of a Monaco weekend to the sensory overload of a MotoGP night race in Qatar, I&apos;ve learned that
                the race itself is only half the trip.
              </p>
              <p>
                Every time I planned a race trip, I found the same problem: the information was scattered across ten different tabs,
                half of it was wrong, and nobody was telling you about the neighbourhood restaurant three streets from the circuit
                that would make the whole weekend. Race Weekend is my answer to that problem.
              </p>
              <p>
                The guides, FAQs, and experience curation on this site come from real research — a combination of first-hand
                knowledge, fan communities, and on-the-ground reporting. If something is here, it&apos;s because it&apos;s genuinely useful.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border-subtle)] mb-16" />

          {/* Studio section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--text-tertiary)] mb-3">The Studio</p>
              <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">Codephilic Studio</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Codephilic Studio is a one-person operation focused on building focused, opinionated tools for niche
                communities. No VC. No bloat. Just clean software for people who care deeply about their thing.
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--text-tertiary)] mb-3">The Stack</p>
              <ul className="space-y-2 text-sm">
                {[
                  ['Framework', 'Next.js 16 App Router'],
                  ['Database', 'SQLite via Drizzle ORM'],
                  ['Data', 'GetYourGuide API + OpenF1'],
                  ['Hosting', 'Vercel'],
                  ['Design', 'Tailwind CSS + Framer Motion'],
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center gap-3">
                    <span className="text-[var(--text-tertiary)] text-[11px] uppercase tracking-wider w-24 flex-shrink-0">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {[
              { icon: '🏎️', title: 'Race-First', body: 'Every feature is designed around how fans actually experience race weekends.' },
              { icon: '⚡', title: 'Fast by Default', body: 'Static where possible, cached aggressively, no unnecessary client JavaScript.' },
              { icon: '🔒', title: 'No Nonsense', body: 'No accounts required. No dark patterns. No algorithm. Just useful information.' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <p className="text-3xl mb-3">{item.icon}</p>
                <p className="font-display font-black text-white uppercase text-sm mb-2">{item.title}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 rounded-full bg-[var(--accent-teal)] text-[var(--bg-primary)] font-black hover:opacity-90 transition-opacity"
            >
              Get in Touch →
            </Link>
            <Link
              href="/"
              className="px-8 py-3 rounded-full border border-[var(--border-subtle)] text-white font-bold hover:border-white/30 transition-colors"
            >
              Browse Races
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
