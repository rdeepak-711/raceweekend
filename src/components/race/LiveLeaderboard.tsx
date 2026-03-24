'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Driver {
  position: number;
  driverNumber: number;
  fullName: string;
  nameAcronym: string;
  teamName: string;
  teamColour: string;
  headshotUrl?: string;
}

export default function LiveLeaderboard({ sessionKey }: { sessionKey: number }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/openf1/leaderboard?sessionKey=${sessionKey}`);
      const json = await res.json();
      if (json.data) setDrivers(json.data);
    } catch (e) {
      console.error('Failed to update leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // 30s updates
    return () => clearInterval(interval);
  }, [sessionKey]);

  if (loading && !drivers.length) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">LIVE_STANDINGS</h4>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
          <span className="text-[10px] font-mono text-[var(--accent-teal)] font-bold">STREAM_ACTIVE</span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {drivers.map((d) => (
          <motion.div
            key={d.driverNumber}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group flex items-center gap-4 p-2 bg-[var(--bg-secondary)] border border-white/5 rounded-xl hover:border-white/10 transition-all"
          >
            <div className="w-8 text-center font-display font-black text-white italic italic italic italic">
              {d.position}
            </div>
            
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: d.teamColour }} />
            
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-black/40 border border-white/5 shrink-0">
              {d.headshotUrl ? (
                <img
                  src={d.headshotUrl}
                  alt={d.nameAcronym}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.endsWith('/og-hero.jpg')) return;
                    img.src = '/og-hero.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/20">
                  {d.nameAcronym}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">
                {d.fullName}
              </p>
              <p className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest truncate">
                {d.teamName}
              </p>
            </div>

            <div className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] group-hover:text-white transition-colors pr-2">
              #{d.driverNumber}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
