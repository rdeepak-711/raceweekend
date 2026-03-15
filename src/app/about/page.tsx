import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Story | Race Weekend',
  description: 'Built for fans, by a fan. Race Weekend is a solo project by Codephilic Studio, designed to simplify F1 and MotoGP travel planning.',
  alternates: { canonical: 'https://raceweekend.app/about' },
  openGraph: {
    title: 'Our Story — Why We Built Race Weekend',
    description: 'F1 and MotoGP travel planning made beautifully simple. Built by Codephilic Studio.',
    images: [{ url: 'https://raceweekend.app/og/about.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://raceweekend.app/og/about.jpg'],
  },
};

export default async function AboutPage() {
  await headers();
  return (
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
              Race Weekend is a side project born out of a simple frustration: planning a trip to a Grand Prix involves
              a dozen browser tabs, three booking sites, and too many Reddit threads. There had to be a better way.
            </p>
            <p>
              So I built one.
            </p>
            <p>
              This app pulls together F1 and MotoGP session schedules, curated local experiences from GetYourGuide,
              and practical travel guides — all in one place, designed for the fan who wants to <em>actually enjoy</em>
              {' '}the weekend, not just survive the logistics.
            </p>
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
                  ['Framework', 'Next.js 15 App Router'],
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
  );
}
