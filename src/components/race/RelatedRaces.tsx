import Link from 'next/link';
import type { Race } from '@/types/race';
import { getThemeFromRace } from '@/lib/constants/raceThemes';

interface Props {
  races: Race[];
  series: 'f1' | 'motogp';
}

export default function RelatedRaces({ races, series }: Props) {
  if (!races.length) return null;

  return (
    <section className="mb-20">
      <h2 className="font-display font-black text-2xl text-white uppercase italic tracking-tighter mb-6">
        Nearby Races
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {races.map(race => {
          const theme = getThemeFromRace(race);
          const raceDate = new Date(race.raceDate);
          const dateLabel = raceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <Link
              key={race.slug}
              href={`/${series}/${race.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all hover:-translate-y-0.5 p-5"
            >
              <div
                className="absolute top-0 left-0 w-full h-1 opacity-60"
                style={{ backgroundColor: theme.accent }}
              />
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{race.flagEmoji ?? '🏁'}</span>
                <div>
                  <p className="font-display font-black text-sm text-white uppercase italic tracking-tight group-hover:text-[var(--accent-teal)] transition-colors">
                    {race.city}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
                    R{race.round} · {dateLabel}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] truncate">{race.circuitName}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
