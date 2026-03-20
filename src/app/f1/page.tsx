import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getRacesBySeries } from '@/services/race.service';
import SeriesLandingClient from '@/components/race/SeriesLandingClient';

export const metadata: Metadata = {
  title: 'F1 2026 Race Calendar & Travel Guides',
  description: 'Full Formula 1 2026 race calendar. 24 rounds across 5 continents. Plan your weekend with session times, local experiences, and booking tips.',
  alternates: { canonical: 'https://raceweekend.co/f1' },
  openGraph: {
    title: 'F1 2026 Race Calendar & Travel Guides',
    description: '24 rounds across 5 continents. Plan your F1 race weekend with session times, local experiences, and tickets.',
    images: [{ url: 'https://raceweekend.co/og/f1.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://raceweekend.co/og/f1.jpg'],
  },
};

export default async function F1LandingPage() {
  await headers();
  const races = await getRacesBySeries('f1');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b border-[var(--border-subtle)]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[var(--accent-f1)]/15 blur-[140px] rounded-full pointer-events-none" />
        {/* Circuit watermark */}
        <img
          src="/tracks/Shanghai_Circuit.avif"
          alt="Circuit layout watermark"
          aria-hidden
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[180%] w-auto max-w-[60%] object-contain opacity-[0.06] pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-f1)] mb-4">2026 Season</p>
          <h1 className="font-display font-black text-6xl md:text-8xl text-white mb-6 uppercase tracking-tighter italic">
            Formula <span className="text-[var(--accent-f1)]">1</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-medium max-w-xl mx-auto">
            24 rounds across 5 continents. Your ultimate trackside travel companion.
          </p>
        </div>
      </section>

      <SeriesLandingClient races={races} series="f1" />
    </div>
  );
}
