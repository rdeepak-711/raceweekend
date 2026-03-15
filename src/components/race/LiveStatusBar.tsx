'use client';

import { useEffect, useState } from 'react';
import type { LiveSessionData } from '@/app/api/live-session/route';

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function LiveStatusBar() {
  const [data, setData] = useState<LiveSessionData | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStatus() {
      try {
        const res = await fetch('/api/live-session');
        if (!res.ok) return;
        const json: LiveSessionData = await res.json();
        if (mounted) setData(json);
      } catch {
        // Fail silently
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!data || data.status === 'none') return null;

  return (
    <div className="w-full h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex items-center justify-center px-4">
      {data.status === 'live' && (
        <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400">LIVE</span>
          <span className="text-[var(--text-secondary)]">·</span>
          <span className="text-white truncate max-w-[120px] sm:max-w-none">{data.sessionName}</span>
          {data.raceCity && (
            <>
              <span className="text-[var(--text-secondary)]">·</span>
              <span className="text-[var(--text-secondary)] truncate max-w-[80px] sm:max-w-none">{data.raceCity}</span>
            </>
          )}
        </p>
      )}
      {data.status === 'upcoming' && (
        <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="text-[var(--accent-teal)]">NEXT</span>
          <span>·</span>
          <span className="text-white truncate max-w-[120px] sm:max-w-none">{data.sessionName}</span>
          {data.raceCity && (
            <>
              <span>·</span>
              <span className="truncate max-w-[80px] sm:max-w-none">{data.raceCity}</span>
            </>
          )}
          {data.minutesUntil !== undefined && (
            <>
              <span>·</span>
              <span className="text-white">in {formatMinutes(data.minutesUntil)}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
