'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import RaceCountdown from '@/components/race/RaceCountdown';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import type { Race } from '@/types/race';

interface Props {
  races: Race[];
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function RaceCardsGrid({ races }: Props) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {races.map(race => {
        const theme = getThemeFromRace(race);
        const raceDateTime = `${race.raceDate}T14:00:00`;

        return (
          <motion.div
            key={race.id}
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative p-6 rounded-2xl border bg-[var(--bg-secondary)] overflow-hidden"
            style={{ borderColor: theme.accent + '40' }}
          >
            {/* Glow accent */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: theme.glowColor }}
            />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{race.flagEmoji}</span>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
                    Round {race.round} · {race.raceDate}
                  </p>
                </div>
              </div>

              {/* City */}
              <h3 className="font-display font-black text-2xl text-white uppercase leading-none mb-1">
                {race.city}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{race.circuitName}</p>

              {/* Countdown */}
              <div className="mb-5">
                <RaceCountdown targetDate={raceDateTime} accentColor={theme.accent} />
              </div>

              {/* CTA */}
              <Link
                href={`/f1/${race.slug}`}
                className="block text-center py-2.5 rounded-full font-bold text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.accent }}
              >
                Explore {race.city} →
              </Link>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
