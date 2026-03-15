'use client';

import React, { useState, useMemo } from 'react';
import { Race } from '@/types/race';
import SeriesCalendarFilters, { Continent, CONTINENT_MAP } from './SeriesCalendarFilters';
import RaceCard from './RaceCard';

interface SeriesLandingClientProps {
  races: Race[];
  series: 'f1' | 'motogp';
}

const SeriesLandingClient = ({ races, series }: SeriesLandingClientProps) => {
  const [activeContinent, setActiveContinent] = useState<Continent>('All');
  const [activeMonth, setActiveMonth] = useState<string>('All');

  const filteredRaces = useMemo(() => {
    return races.filter(race => {
      const continentMatch = activeContinent === 'All' || CONTINENT_MAP[race.countryCode] === activeContinent;
      const month = new Date(race.raceDate).toLocaleString('en-US', { month: 'long' });
      const monthMatch = activeMonth === 'All' || month === activeMonth;
      return continentMatch && monthMatch;
    });
  }, [races, activeContinent, activeMonth]);

  return (
    <>
      <SeriesCalendarFilters 
        races={races}
        activeContinent={activeContinent}
        setActiveContinent={setActiveContinent}
        activeMonth={activeMonth}
        setActiveMonth={setActiveMonth}
      />

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {filteredRaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRaces.map(race => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
            <p className="text-[var(--text-secondary)] text-lg mb-4">No races found matching your filters.</p>
            <button 
              onClick={() => { setActiveContinent('All'); setActiveMonth('All'); }}
              className="text-[var(--accent-teal)] font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SeriesLandingClient;
