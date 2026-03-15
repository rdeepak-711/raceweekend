'use client';

import React, { useState } from 'react';
import LiveLeaderboard from './LiveLeaderboard';
import LiveWeather from './LiveWeather';
import TelemetryVisualizer from '../layout/TelemetryVisualizer';
import { motion } from 'framer-motion';

export default function LiveTacticalHub({ sessionKey, sessionName }: { sessionKey: number; sessionName: string }) {
  const [latency, setLatency] = useState(42);

  return (
    <div className="w-full space-y-8" role="region" aria-label="Live Race Tactical Hub">
      {/* Weather Strip */}
      <LiveWeather sessionKey={sessionKey} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Standings */}
        <div 
          className="lg:col-span-1 h-[600px] overflow-y-auto pr-2 scrollbar-hide"
          role="complementary"
          aria-label="Live Leaderboard"
        >
          <LiveLeaderboard sessionKey={sessionKey} />
        </div>

        {/* Right: Telemetry & Comms */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--accent-teal)]" />
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none" aria-hidden="true">
              <span className="text-9xl font-display font-black italic">LIVE</span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="px-3 py-1 rounded bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 text-[10px] font-black text-[var(--accent-teal)] uppercase tracking-widest animate-pulse"
                  role="status"
                >
                  SESSION_ACTIVE
                </div>
                <h3 className="font-display font-black text-2xl text-white uppercase italic tracking-tight">
                  {sessionName}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em]">TELEMETRY_FEED_V1</p>
                    <p className="text-[10px] font-mono text-[var(--accent-teal)] font-bold uppercase tracking-widest">LATENCY: {latency}MS</p>
                  </div>
                  <TelemetryVisualizer sessionKey={sessionKey} onLatencyUpdate={setLatency} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Track_Status</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      <p className="text-white font-bold text-sm uppercase italic">Track Clear</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">DRS_Status</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)] shadow-[0_0_10px_var(--accent-teal)]" />
                      <p className="text-white font-bold text-sm uppercase italic">Enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-6 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
              Launch Live Timing ↗
            </button>
            <button className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-white/5 transition-all">
              Team Radio Stream 📻
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
