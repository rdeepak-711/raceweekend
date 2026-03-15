'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Race } from '@/types/race';
import { RaceTheme } from '@/lib/constants/raceThemes';
import RaceCountdown from '@/components/race/RaceCountdown';
import SeriesBadge from '@/components/race/SeriesBadge';

interface RaceHeroProps {
  race: Race;
  theme: RaceTheme;
  series: 'f1' | 'motogp';
  circuitUrl?: string;
}

const RaceHero = ({ race, theme, series, circuitUrl }: RaceHeroProps) => {
  const raceDateTime = `${race.raceDate}T14:00:00`;

  const today = new Date().toISOString().slice(0, 10);
  const isPast = race.raceDate < today;

  return (
    <section className="relative w-full py-16 md:py-28 overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">

      {/* Track image — full-bleed background, right-anchored */}
      {circuitUrl && (
        <div className="absolute inset-0 pointer-events-none select-none">
          <Image
            src={circuitUrl}
            alt={`${race.circuitName} circuit layout`}
            fill
            priority
            className="absolute right-0 top-1/2 -translate-y-1/2 h-[140%] w-auto max-w-[70%] object-contain opacity-[0.13]"
          />
          {/* Fade edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/60 via-transparent to-[var(--bg-primary)]/80" />
        </div>
      )}

      {/* Accent glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] blur-[140px] rounded-full pointer-events-none opacity-15"
        style={{ background: `radial-gradient(ellipse, ${theme.accent} 0%, transparent 70%)` }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center text-center gap-6">

        {/* Badge row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <SeriesBadge series={series} size="sm" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
            Round {race.round} · {race.season}
          </span>
        </motion.div>

        {/* Flag + Race name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-5xl md:text-6xl leading-none" role="img" aria-label="flag">
            {race.flagEmoji || '🏁'}
          </span>
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl text-white uppercase tracking-tighter italic leading-none">
            {race.name}
          </h1>
        </motion.div>

        {/* Circuit · City · Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[var(--text-secondary)] font-medium text-base md:text-lg"
        >
          <span>{race.circuitName}</span>
          <span className="text-[var(--text-tertiary)]">·</span>
          <span>{race.city}, {race.country}</span>
          <span className="text-[var(--text-tertiary)]">·</span>
          <span>{new Date(race.raceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </motion.div>

        {/* Status / Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`w-full max-w-lg bg-white/5 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/8 shadow-2xl ${isPast ? 'border-[var(--text-tertiary)]/20 grayscale-[0.3]' : ''}`}
        >
          {isPast ? (
            <div className="flex flex-col items-center py-4">
              <span className="text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest mb-2">Race Weekend Status</span>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] opacity-50" />
                 <span className="font-display font-black text-4xl md:text-5xl text-[var(--text-tertiary)] uppercase italic tracking-tighter">
                   COMPLETED
                 </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest">Race Countdown</span>
                <span className="text-[var(--accent-teal)] text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-teal)]/10 animate-pulse uppercase tracking-wider">
                  Live Weekend
                </span>
              </div>
              <RaceCountdown targetDate={raceDateTime} size="lg" />
            </>
          )}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {isPast ? (
            <>
              <Link
                href={`/${series}/${race.slug}/guide`}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl uppercase tracking-wider text-sm"
                style={{ backgroundColor: theme.accent, boxShadow: `0 10px 30px -8px ${theme.accent}60` }}
              >
                View City Guide →
              </Link>
              <Link
                href={`/${series}/${race.slug}/experiences`}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full font-black text-white border border-white/15 hover:bg-white/8 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider text-sm"
              >
                Past Experiences
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/${series}/${race.slug}/tickets`}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl uppercase tracking-wider text-sm"
                style={{ backgroundColor: theme.accent, boxShadow: `0 10px 30px -8px ${theme.accent}60` }}
              >
                View Tickets →
              </Link>
              <Link
                href={`/itinerary?race=${race.id}`}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full font-black text-white border border-white/15 hover:bg-white/8 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider text-sm"
              >
                Plan My Weekend
              </Link>
            </>
          )}
        </motion.div>

      </div>
    </section>
  );
};

export default RaceHero;
