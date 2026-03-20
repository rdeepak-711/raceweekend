import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getRacesBySeries } from '@/services/race.service';
import SeriesLandingClient from '@/components/race/SeriesLandingClient';

export const metadata: Metadata = {
  title: 'MotoGP 2026 Grand Prix Calendar & Travel Guides',
  description: 'Complete MotoGP 2026 season calendar. All Grand Prix races with sessions, circuits, and local travel guides for bike fans.',
  alternates: { canonical: 'https://raceweekend.co/motogp' },
  openGraph: {
    title: 'MotoGP 2026 Grand Prix Calendar & Travel Guides',
    description: 'Complete MotoGP 2026 season calendar. All Grand Prix races with dates, circuits, and travel guides.',
    images: [{ url: 'https://raceweekend.co/og/motogp.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://raceweekend.co/og/motogp.jpg'],
  },
};

export default async function MotoGPPage() {
  await headers();
  const races = await getRacesBySeries('motogp');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden border-b border-[var(--border-subtle)]">
        {/* MotoGP Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-motogp)]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-6 uppercase tracking-tighter italic">
            MotoGP <span className="text-[var(--accent-motogp)]">2026</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
            The ultimate trackside travel companion for every Grand Prix.
          </p>
        </div>
      </section>

      <SeriesLandingClient races={races} series="motogp" />
    </div>
  );
}
