'use client';

import React, { useState } from 'react';
import { Race } from '@/types/race';
import RaceCard from '@/components/race/RaceCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeriesContext } from '@/context/SeriesContext';

interface TabbedCalendarProps {
  f1Races: Race[];
  motogpRaces: Race[];
}

const TabbedCalendar = ({ f1Races, motogpRaces }: TabbedCalendarProps) => {
  const { activeSeries, setActiveSeries } = useSeriesContext();
  const [activeTab, setActiveTab] = useState<'f1' | 'motogp'>(activeSeries);

  const switchTab = (tab: 'f1' | 'motogp') => {
    setActiveTab(tab);
    setActiveSeries(tab);
  };

  const activeRaces = activeTab === 'f1' ? f1Races : motogpRaces;
  
  // Group races by month
  const groupedRaces: { [key: string]: Race[] } = {};
  activeRaces.forEach(race => {
    const month = new Date(race.raceDate).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!groupedRaces[month]) {
      groupedRaces[month] = [];
    }
    groupedRaces[month].push(race);
  });

  const months = Object.keys(groupedRaces).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <section className="relative max-w-7xl mx-auto px-6 mb-32">
      {/* Season Progress Bar (Left Edge) */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 hidden xl:block">
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: '100%' }}
          transition={{ duration: 2 }}
          className="w-full bg-gradient-to-b from-[var(--accent-f1)] via-[var(--accent-motogp)] to-[var(--accent-teal)]"
        />
      </div>

      <div className="flex flex-col gap-8 mb-16 pt-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-pulse" />
            <span className="text-[10px] font-mono font-black text-[var(--accent-teal)] uppercase tracking-[0.4em]">CALENDAR_STREAM_V1.0</span>
          </div>
          <h2 className="font-display font-black text-5xl md:text-7xl text-white mb-4 uppercase tracking-tighter italic">
            THE 2026 SEASON
          </h2>
          <p className="text-[var(--text-secondary)] font-mono text-xs uppercase tracking-wider max-w-lg leading-loose">
            Full telemetry for all 24 rounds. Select a sector to initialize trip planning.
          </p>
        </div>
      </div>

      {/* Sticky series switcher */}
      <div className="sticky top-14 z-20 -mx-6 px-6 py-3 mb-16 bg-[#06060A]/90 backdrop-blur-md border-b border-white/5 flex items-center gap-3">
        <button
          onClick={() => switchTab('f1')}
          className={`px-6 py-2 font-display font-black text-sm uppercase italic tracking-wider border transition-all ${
            activeTab === 'f1'
              ? 'bg-[var(--accent-f1)] border-[var(--accent-f1)] text-white shadow-[0_0_20px_rgba(225,6,0,0.25)]'
              : 'bg-white/5 border-white/10 text-[var(--text-tertiary)] hover:border-white/30 hover:text-white'
          }`}
        >
          🏎️ Formula 1
        </button>
        <button
          onClick={() => switchTab('motogp')}
          className={`px-6 py-2 font-display font-black text-sm uppercase italic tracking-wider border transition-all ${
            activeTab === 'motogp'
              ? 'bg-[var(--accent-motogp)] border-[var(--accent-motogp)] text-white shadow-[0_0_20px_rgba(255,107,0,0.25)]'
              : 'bg-white/5 border-white/10 text-[var(--text-tertiary)] hover:border-white/30 hover:text-white'
          }`}
        >
          🏍️ MotoGP
        </button>
        <span className="ml-auto text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest hidden sm:block">
          {activeRaces.length} rounds · 2026
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-32"
        >
          {months.map((month, monthIndex) => (
            <div key={month} className="relative">
              {/* Upgraded Month Header */}
              <div className="sticky top-[7rem] z-10 flex items-center gap-8 bg-[#06060A]/90 backdrop-blur-md py-6 mb-12 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border border-[var(--accent-teal)] text-[var(--accent-teal)] font-display font-black text-xl italic bg-[var(--accent-teal)]/5">
                    {monthIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-3xl text-white uppercase tracking-tighter italic">
                      {month.split(' ')[0]}
                    </h3>
                    <p className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-[0.3em]">
                      PHASE_{month.split(' ')[1]}
                    </p>
                  </div>
                </div>
                <div className="h-px flex-grow bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">
                {groupedRaces[month].map((race, i) => (
                  <motion.div
                    key={race.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={i % 2 === 1 ? 'lg:mt-12' : ''} // Staggered 2-col layout
                  >
                    <RaceCard race={race} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default TabbedCalendar;
