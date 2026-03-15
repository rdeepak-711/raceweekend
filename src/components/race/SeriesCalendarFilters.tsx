'use client';

import React, { useMemo } from 'react';
import { Race } from '@/types/race';

export type Continent = 'All' | 'Europe' | 'Americas' | 'Asia-Pacific' | 'Middle East';

interface SeriesCalendarFiltersProps {
  races: Race[];
  activeContinent: Continent;
  setActiveContinent: (continent: Continent) => void;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
}

export const CONTINENT_MAP: Record<string, Continent> = {
  AU: 'Asia-Pacific',
  CN: 'Asia-Pacific',
  JP: 'Asia-Pacific',
  BH: 'Middle East',
  SA: 'Middle East',
  AZ: 'Middle East', // Following prompt categories
  MC: 'Europe',
  ES: 'Europe',
  CA: 'Americas',
  AT: 'Europe',
  GB: 'Europe',
  HU: 'Europe',
  BE: 'Europe',
  NL: 'Europe',
  IT: 'Europe',
  SG: 'Asia-Pacific',
  US: 'Americas',
  MX: 'Americas',
  BR: 'Americas',
  QA: 'Middle East',
  AE: 'Middle East',
};

const SeriesCalendarFilters = ({ 
  races, 
  activeContinent, 
  setActiveContinent,
  activeMonth,
  setActiveMonth 
}: SeriesCalendarFiltersProps) => {
  
  const months = useMemo(() => {
    const uniqueMonths = new Set<string>();
    races.forEach(race => {
      const month = new Date(race.raceDate).toLocaleString('en-US', { month: 'long' });
      uniqueMonths.add(month);
    });
    return ['All', ...Array.from(uniqueMonths)];
  }, [races]);

  const continents: Continent[] = ['All', 'Europe', 'Americas', 'Asia-Pacific', 'Middle East'];

  return (
    <div className="sticky top-[56px] z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] py-4 mb-8">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {/* Continent Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Region:</span>
          <div className="flex gap-2">
            {continents.map(continent => (
              <button
                key={continent}
                onClick={() => setActiveContinent(continent)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeContinent === continent
                    ? 'bg-white text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]'
                }`}
              >
                {continent}
              </button>
            ))}
          </div>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Month:</span>
          <div className="flex gap-2">
            {months.map(month => (
              <button
                key={month}
                onClick={() => setActiveMonth(month)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeMonth === month
                    ? 'bg-[var(--accent-teal)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesCalendarFilters;
