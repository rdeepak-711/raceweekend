'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import RaceCountdown from '@/components/race/RaceCountdown';

interface Props {
  nextRaceDate?: string;
  nextRaceSlug?: string;
  nextRaceCity?: string;
  nextRaceAccent?: string;
}

export default function AnimatedHero({ nextRaceDate, nextRaceSlug, nextRaceCity, nextRaceAccent }: Props) {
  const accentColor = nextRaceAccent ?? '#00C9A0';

  return (
    <section className="relative max-w-4xl mx-auto text-center py-20 overflow-hidden">
      {/* Background glow effects */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] -z-10"
        style={{ backgroundColor: accentColor + '25' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-f1)]/15 rounded-full blur-[100px] -z-10"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs font-bold uppercase tracking-[0.2em] mb-6"
        style={{ color: accentColor }}
      >
        F1 2026 · 4 Grands Prix · Live Timing
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display font-black text-6xl sm:text-7xl lg:text-8xl text-white uppercase leading-[0.9] mb-6 tracking-tighter"
      >
        YOUR RACE<br />
        <span style={{ color: 'var(--accent-f1)' }}>WEEK</span>END<br />
        GUIDE
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-6 font-medium leading-relaxed"
      >
        Curated experiences, trackside schedules, ticket listings, and shareable itineraries for every F1 Grand Prix.
      </motion.p>

      {/* Next race countdown */}
      {nextRaceDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex flex-col items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              Next Race · {nextRaceCity}
            </p>
            <RaceCountdown targetDate={nextRaceDate} accentColor={nextRaceAccent} />
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        {nextRaceSlug && (
          <Link
            href={`/f1/${nextRaceSlug}`}
            className="group relative w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white overflow-hidden"
            style={{ backgroundColor: accentColor }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
            <span className="relative">Plan {nextRaceCity} →</span>
          </Link>
        )}
        <Link
          href="/itinerary"
          className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white border border-white/30 hover:border-white/60 transition-colors"
        >
          Build Itinerary
        </Link>
      </motion.div>
    </section>
  );
}
