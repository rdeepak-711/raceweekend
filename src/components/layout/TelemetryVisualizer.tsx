'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const heights = [40, 60, 45, 90, 70, 85, 60, 75, 50, 65, 80, 55, 95, 70, 60];

export default function TelemetryVisualizer({ sessionKey, onLatencyUpdate }: { sessionKey?: number; onLatencyUpdate?: (ms: number) => void }) {
  const [data, setData] = useState<number[]>(heights);
  const [isLive, setIsLive] = useState(false);

  const fetchTelemetry = async () => {
    if (!sessionKey) return;
    const start = performance.now();
    try {
      const res = await fetch(`/api/openf1/telemetry?sessionKey=${sessionKey}`);
      const json = await res.json();
      const end = performance.now();
      onLatencyUpdate?.(Math.round(end - start));
      
      if (json.data && json.data.length > 0) {
        // Map speeds to percentages (max speed ~350 km/h)
        const speeds = json.data.map((d: any) => Math.min(100, (d.speed / 350) * 100));
        setData(speeds.slice(-20)); // Keep latest 20 points
        setIsLive(true);
      }
    } catch {}
  };

  useEffect(() => {
    if (sessionKey) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 10000); // 10s updates
      return () => clearInterval(interval);
    }
  }, [sessionKey]);

  return (
    <div 
      className="relative h-32 bg-black/40 border border-white/5 rounded-sm overflow-hidden flex items-end px-2 pb-2 gap-1 group"
      role="img"
      aria-label={`Live telemetry visualization for session ${sessionKey}. Showing ${isLive ? 'real-time' : 'simulated'} data stream.`}
    >
      <div className="absolute top-2 left-3 z-10">
        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
          {isLive ? 'LIVE_DATA_STREAM' : 'MOCK_TELEMETRY_SIGNAL'}
        </p>
      </div>
      
      {data.map((h, i) => (
        <motion.div 
          key={`${isLive ? 'live' : 'mock'}-${i}`}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ 
            duration: isLive ? 0.5 : 1.5,
            delay: i * 0.05,
            repeat: isLive ? 0 : Infinity,
            repeatType: 'reverse'
          }}
          className={`flex-1 border-t ${isLive ? 'bg-[var(--accent-teal)]/40 border-[var(--accent-teal)]' : 'bg-white/5 border-white/10'}`}
        />
      ))}
    </div>
  );
}
