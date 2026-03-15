'use client';

import { useEffect, useState } from 'react';
import type { PositionEntry } from '@/app/api/openf1/positions/route';

interface Props {
  sessionKey: number;
  raceAccent: string;
}

export default function SessionLiveWidget({ sessionKey, raceAccent }: Props) {
  const [positions, setPositions] = useState<PositionEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPositions() {
      try {
        const res = await fetch(`/api/openf1/positions?sessionKey=${sessionKey}`);
        if (!res.ok) return;
        const data: PositionEntry[] = await res.json();
        if (mounted) {
          setPositions(data);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }

    fetchPositions();
    const interval = setInterval(fetchPositions, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sessionKey]);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-3">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: raceAccent }} />
        <span className="text-xs text-[var(--text-secondary)]">Loading positions…</span>
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--text-secondary)]">Positions not yet available</p>
      </div>
    );
  }

  const top5 = positions.slice(0, 5);

  return (
    <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border" style={{ borderColor: raceAccent + '30' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: raceAccent }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: raceAccent }}>Live Positions</p>
      </div>
      <div className="space-y-2">
        {top5.map(entry => (
          <div key={entry.driverNumber} className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono w-5 text-[var(--text-tertiary)]">P{entry.position}</span>
            <span
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#' + entry.teamColour.replace('#', '') }}
            />
            <span className="text-sm font-bold text-white font-mono">{entry.acronym}</span>
            <span className="text-xs text-[var(--text-secondary)] hidden sm:block">{entry.teamName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
