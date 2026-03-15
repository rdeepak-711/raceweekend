import React from 'react';
import Link from 'next/link';
import { Race } from '@/types/race';
import RaceCountdown from '@/components/race/RaceCountdown';
import SeriesBadge from '@/components/race/SeriesBadge';
import { getThemeFromRace } from '@/lib/constants/raceThemes';

interface UpcomingRacesStripProps {
  races: Race[];
}

const UpcomingRacesStrip = ({ races }: UpcomingRacesStripProps) => {
  if (!races || races.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 -mt-12 mb-20 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {races.slice(0, 2).map((race) => {
          const theme = getThemeFromRace(race);
          const accentColor = race.series === 'f1' ? 'var(--accent-f1)' : 'var(--accent-motogp)';
          
          // Calculate days until race
          const raceDate = new Date(`${race.raceDate}T14:00:00`);
          const now = new Date();
          const diffTime = raceDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const urgencyText = diffDays > 0 ? `Race in ${diffDays} days` : 'Race weekend is here!';

          return (
            <div 
              key={race.id}
              className="group relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-white/20 transition-all duration-300 shadow-xl"
            >
              {/* Subtle accent glow */}
              <div 
                className="absolute -right-20 -top-20 w-40 h-40 blur-[80px] rounded-full opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"
                style={{ backgroundColor: accentColor }}
              />

              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl leading-none mt-1" role="img" aria-label="flag">
                      {race.flagEmoji || '🏁'}
                    </span>
                    <div>
                      <SeriesBadge series={race.series} size="sm" />
                      <h3 className="font-display font-black text-3xl text-white mt-2 group-hover:text-[var(--accent-teal)] transition-colors italic tracking-tighter leading-none">
                        {race.city}
                      </h3>
                      <p className="text-[10px] font-mono font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] mt-2">
                        {race.name}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right bg-white/5 px-4 py-3 rounded-xl border border-white/5 min-w-[140px]">
                    <p className="text-[9px] font-black text-[var(--accent-teal)] uppercase tracking-[0.4em] mb-1">
                      {new Date(race.raceDate).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-white font-display font-bold text-2xl uppercase italic tracking-tighter">
                      {new Date(race.raceDate).toLocaleDateString('en-US', { day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--bg-primary)]/50 rounded-xl p-4 mb-6 border border-white/5">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-wider">Countdown</span>
                     <span className="text-[var(--accent-teal)] text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-teal)]/10 animate-pulse">
                       {urgencyText}
                     </span>
                   </div>
                   <RaceCountdown 
                     targetDate={`${race.raceDate}T14:00:00`} 
                     size="sm"
                   />
                </div>

                <div className="flex gap-3">
                  <Link 
                    href={`/${race.series}/${race.slug}/tickets`}
                    className="flex-1 text-center py-2.5 rounded-lg font-bold text-white transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    Get Tickets
                  </Link>
                  <Link 
                    href={`/${race.series}/${race.slug}`}
                    className="flex-1 text-center py-2.5 rounded-lg font-bold text-white border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Plan Trip
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingRacesStrip;
