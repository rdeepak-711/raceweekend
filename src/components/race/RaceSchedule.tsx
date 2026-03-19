'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Session } from '@/types/race';
import { formatTime } from '@/lib/utils';

interface Props {
  sessions: Session[];
  timezone?: string;
  accentColor?: string;
  raceDate?: string;
  isCancelled?: boolean;
}

const DAY_ORDER = ['Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

interface SeriesMeta {
  label: string;
  color: string;
  priority: number;
}

const SERIES_MAP: Record<string, SeriesMeta> = {
  f1:          { label: 'Formula 1',           color: 'var(--accent-f1)',   priority: 1 },
  f2:          { label: 'Formula 2',           color: 'var(--accent-teal)', priority: 2 },
  f3:          { label: 'Formula 3',           color: '#64748b',            priority: 3 },
  motogp:      { label: 'MotoGP',              color: '#FF6600',            priority: 1 },
  moto2:       { label: 'Moto2',               color: '#E63946',            priority: 2 },
  moto3:       { label: 'Moto3',               color: '#3B82F6',            priority: 3 },
  porsche:     { label: 'Porsche Supercup',    color: '#94a3b8',            priority: 4 },
  supercars:   { label: 'Supercars',           color: '#94a3b8',            priority: 5 },
  experiences: { label: 'Experiences & Tours', color: '#a855f7',            priority: 6 },
  promoter:    { label: 'Fan Events',          color: '#f97316',            priority: 7 },
  press:       { label: 'Press Events',        color: '#64748b',            priority: 8 },
};

function getSeriesMeta(key: string | null): SeriesMeta {
  if (!key) return { label: 'Event', color: '#64748b', priority: 99 };
  return SERIES_MAP[key] || { label: key.toUpperCase(), color: '#64748b', priority: 90 };
}

function getSessionStatus(
  session: Session,
  raceDate?: string,
  timezone?: string
): 'completed' | 'live' | 'upcoming' {
  if (!raceDate) return 'upcoming';
  
  try {
    const dayMap = { 'Thursday': -3, 'Friday': -2, 'Saturday': -1, 'Sunday': 0 };
    const offset = (dayMap as any)[session.dayOfWeek] ?? 0;
    const sessionDate = new Date(raceDate);
    sessionDate.setDate(sessionDate.getDate() + offset);
    const dateStr = sessionDate.toISOString().split('T')[0];

    const tz = timezone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const now = new Date();
    const parts = formatter.formatToParts(now);
    const p: any = {};
    parts.forEach(part => p[part.type] = part.value);
    
    // "now" in track timezone
    const nowInTZ = `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
    
    const sessionStartLocal = `${dateStr}T${session.startTime}`;
    const sessionEndLocal = `${dateStr}T${session.endTime}`;

    if (nowInTZ >= sessionStartLocal && nowInTZ <= sessionEndLocal) return 'live';
    if (nowInTZ > sessionEndLocal) return 'completed';
    return 'upcoming';
  } catch (e) {
    return 'upcoming';
  }
}

export default function RaceSchedule({ sessions, accentColor, raceDate, timezone, isCancelled }: Props) {
  const accent = accentColor ?? 'var(--accent-f1)';

  // Add re-render interval for "Live Now" status
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Group by day, sort chronologically, remove overlaps
  const byDay: Record<string, Session[]> = {};

  for (const s of sessions) {
    if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = [];
    byDay[s.dayOfWeek].push(s);
  }

  // Sort each day chronologically and remove overlapping sessions
  for (const day of Object.keys(byDay)) {
    // Sort by start time, then by series priority (higher priority wins ties)
    byDay[day].sort((a, b) => {
      const timeCmp = a.startTime.localeCompare(b.startTime);
      if (timeCmp !== 0) return timeCmp;
      return getSeriesMeta(a.seriesKey).priority - getSeriesMeta(b.seriesKey).priority;
    });

    // Remove overlapping sessions (keep the higher-priority one)
    const filtered: Session[] = [];
    for (const s of byDay[day]) {
      const overlap = filtered.find(
        existing => s.startTime < existing.endTime && s.endTime > existing.startTime
      );
      if (overlap) {
        // If new session has higher priority (lower number), replace
        const newPri = getSeriesMeta(s.seriesKey).priority;
        const existPri = getSeriesMeta(overlap.seriesKey).priority;
        if (newPri < existPri) {
          filtered.splice(filtered.indexOf(overlap), 1, s);
        }
        // Otherwise skip (keep existing higher-priority session)
      } else {
        filtered.push(s);
      }
    }
    byDay[day] = filtered;
  }

  const days = DAY_ORDER.filter(d => byDay[d]);

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-white/10 rounded-xl text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest mb-6">
        <span className="text-sm">⏰</span> All times shown in track local time {timezone ? `(${timezone})` : ''}
      </div>

      {days.map(day => {
        const daySessions = byDay[day];
        // Track which series labels we've already shown
        const shownSeries = new Set<string>();

        return (
          <div key={day} className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Day label */}
            <div className="md:w-16 flex-shrink-0 pt-1">
              <p className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] md:sticky md:top-32 border-b-2 border-[var(--accent-teal)] pb-1 inline-block md:block md:border-b-0">
                {day}
              </p>
            </div>

            {/* Day Content — flat chronological list */}
            <div className="flex-1">
              <div className="border-l-2 border-[var(--border-subtle)] ml-4 pl-6 space-y-4">
                {daySessions.map((s, i) => {
                  const status = getSessionStatus(s, raceDate, timezone);
                  const isLive = status === 'live';
                  const isDone = status === 'completed';
                  const sKey = s.seriesKey || 'other';
                  const meta = getSeriesMeta(sKey);
                  const showSeriesBadge = !shownSeries.has(sKey);
                  if (showSeriesBadge) shownSeries.add(sKey);

                  return (
                    <div key={s.id}>
                      {/* Series badge — shown on first occurrence */}
                      {showSeriesBadge && (
                        <div className="flex items-center gap-3 mb-3 -ml-6 pl-6">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border-subtle)]" />
                          <span
                            className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm"
                            style={{ color: meta.color, borderColor: `${meta.color}40`, backgroundColor: `${meta.color}10` }}
                          >
                            {meta.label}
                          </span>
                          <div className="h-px w-8 bg-[var(--border-subtle)]" />
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="relative flex items-center justify-between py-1 group"
                      >
                        {/* Timeline node */}
                        <div
                          className="absolute -left-[1.65rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)] flex-shrink-0 transition-transform group-hover:scale-125"
                          style={{
                            backgroundColor: isLive ? accent : isDone ? '#4B4B63' : 'var(--border-medium)',
                            boxShadow: isLive ? `0 0 10px ${accent}` : 'none',
                          }}
                        />

                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black font-mono w-10 text-[var(--text-tertiary)] uppercase text-center bg-[var(--bg-tertiary)] py-0.5 rounded border border-white/5">
                            {s.shortName}
                          </span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${isCancelled || isDone ? 'text-[var(--text-tertiary)] line-through opacity-50' : 'text-white'}`}>
                                {s.name}
                              </span>
                              {!showSeriesBadge && (
                                <span
                                  className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
                                  style={{ color: meta.color, backgroundColor: `${meta.color}10` }}
                                >
                                  {meta.label}
                                </span>
                              )}
                            </div>
                            {isLive && (
                              <span className="text-[10px] font-black text-[var(--accent-f1)] animate-pulse uppercase tracking-wider">
                                🔴 Live Now
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-sm font-black tabular-nums ${isCancelled || isDone ? 'text-[var(--text-tertiary)] line-through opacity-50' : 'text-white'}`}>
                            {formatTime(s.startTime)}
                          </p>
                          <p className={`text-[10px] font-bold text-[var(--text-tertiary)] uppercase ${isCancelled ? 'line-through opacity-50' : ''}`}>
                            – {formatTime(s.endTime)}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
