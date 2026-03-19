'use client';

import Link from 'next/link';
import type { Race } from '@/types/race';
import { SERIES_META } from '@/lib/constants/series';
import { motion } from 'framer-motion';
import RaceCountdown from '@/components/race/RaceCountdown';

interface Props {
  race: Race;
  href?: string;
}

export default function RaceCard({ race, href }: Props) {
  const seriesPath = race.series;
  const to = href ?? `/${seriesPath}/${race.slug}`;
  const meta = SERIES_META[race.series];
  const today = new Date().toISOString().slice(0, 10);
  const isPast = race.raceDate < today;
  const hasExperiences = race.hasExperiences ?? true;
  const isCancelled = race.isCancelled;

  const raceDate = new Date(race.raceDate);
  const dateLabel = raceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Cancelled — dimmed card with "CALLED OFF" watermark, no CTAs
  if (isCancelled) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-red-500/20 opacity-60 select-none">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: '#ef444466' }} />
        {/* Diagonal "CALLED OFF" watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span className="font-display font-black text-3xl text-red-500/60 uppercase tracking-widest border-4 border-red-500/50 px-4 py-1 rotate-[-20deg] select-none">
            CALLED OFF
          </span>
        </div>
        <div className="pl-6 pr-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
              R{race.round} · {dateLabel}
            </span>
            <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest border border-red-500/30 px-2 py-0.5 rounded-full">
              Called off
            </span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl grayscale">{race.flagEmoji ?? '🏁'}</span>
            <h3 className="font-display font-black text-xl text-white/50 uppercase italic tracking-tighter">
              {race.city}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] pl-12">{race.circuitName}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={`group relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${isPast ? 'opacity-60' : ''}`}
    >
      {/* Left color stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: meta.color }}
      />

      {/* Subtle accent glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${meta.color}08 0%, transparent 60%)` }}
      />

      <div className="pl-6 pr-5 pt-5 pb-5 relative z-10">

        {/* Round + Date */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ color: meta.color, backgroundColor: `${meta.color}18` }}
          >
            Round {race.round} · {dateLabel}
          </span>
          {isPast && (
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
              Completed
            </span>
          )}
        </div>

        {/* Flag + Race Info row */}
        <div className="mb-4">
          <Link href={to} className="flex items-start gap-4 group/name min-w-0">
            <span className="text-4xl leading-none flex-shrink-0 mt-1">{race.flagEmoji ?? '🏁'}</span>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="font-display font-black text-2xl md:text-3xl text-white uppercase italic tracking-tighter leading-none group-hover/name:text-[var(--accent-teal)] transition-colors">
                {race.city}
              </h3>
              <p className="text-[10px] font-mono font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] truncate">
                {race.name}
              </p>
            </div>
          </Link>
        </div>

        {/* Dedicated Countdown Line */}
        {!isPast && (
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-4 relative overflow-hidden group/timer">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--accent-teal)]/20 to-transparent" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.4em]">START_SEQUENCE</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-[var(--accent-teal)] animate-ping" />
                <span className="text-[8px] font-mono font-bold text-[var(--accent-teal)] uppercase tracking-widest">LIVE_SIGNAL</span>
              </div>
            </div>
            <RaceCountdown
              targetDate={`${race.raceDate}T14:00:00`}
              accentColor={meta.color}
              size="sm"
            />
          </div>
        )}

        {/* Circuit name */}
        <p className={`text-[11px] text-[var(--text-tertiary)] mb-6 leading-tight border-l border-white/5 ml-[0.5rem] ${!isPast ? 'pl-[1rem]' : 'pl-[4.25rem]'}`}>
          {race.circuitName}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          {hasExperiences && (
            <Link
              href={`/${race.series}/${race.slug}/experiences`}
              className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold border border-white/8 text-[var(--text-secondary)] hover:border-[var(--accent-teal)]/50 hover:text-white hover:bg-[var(--accent-teal)]/8 transition-all"
            >
              Experiences
            </Link>
          )}
          <Link
            href={to}
            className={`${hasExperiences ? 'flex-1' : 'w-full'} text-center py-2.5 rounded-xl text-xs font-black text-white transition-all`}
            style={{
              backgroundColor: `${meta.color}22`,
              border: `1px solid ${meta.color}44`,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${meta.color}35`)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${meta.color}22`)}
          >
            View Race →
          </Link>
        </div>
      </div>

      {/* Round number watermark */}
      <div className="absolute bottom-3 right-4 font-display font-black text-7xl text-white/[0.03] pointer-events-none italic leading-none select-none">
        {race.round.toString().padStart(2, '0')}
      </div>
    </motion.div>
  );
}
