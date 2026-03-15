'use client';

import { motion } from 'framer-motion';
import SeriesBadge from '@/components/race/SeriesBadge';
import RaceCountdown from '@/components/race/RaceCountdown';
import type { Race } from '@/types/race';
import type { RaceTheme } from '@/lib/constants/raceThemes';
import type { RaceSeries } from '@/lib/constants/series';

interface Props {
  race: Race;
  raceDateTime: string;
  theme: RaceTheme;
  series: RaceSeries;
}

export default function RaceOverviewHeader({ race, raceDateTime, theme, series }: Props) {
  return (
    <div className="relative pt-8 pb-6 border-b border-[var(--border-subtle)] mb-8 overflow-hidden">
      {/* Radial glow behind city name */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-0"
        style={{ backgroundColor: theme.glowColor }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <SeriesBadge series={series} />
          <span className="text-sm text-[var(--text-secondary)]">Round {race.round} · {race.season}</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{race.flagEmoji}</span>
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display font-black text-4xl sm:text-5xl text-white uppercase leading-none"
          >
            {race.city}
          </motion.h1>
        </div>

        <p className="text-[var(--text-secondary)] text-lg mb-1">{race.circuitName}</p>
        <p className="text-sm text-[var(--text-secondary)] font-mono mb-6">{race.country} · {race.raceDate}</p>

        <RaceCountdown targetDate={raceDateTime} accentColor={theme.accent} />
      </div>
    </div>
  );
}
