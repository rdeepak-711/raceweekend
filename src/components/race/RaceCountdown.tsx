'use client';

import { useEffect, useMemo, useState } from 'react';

interface TimeLeft { d: number; h: number; m: number; s: number; }

interface RaceCountdownProps {
  targetDate: string;
  accentColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function RaceCountdown({ 
  targetDate, 
  accentColor, 
  size = 'md' 
}: RaceCountdownProps) {
  const target = useMemo(() => new Date(targetDate), [targetDate]);
  const [time, setTime] = useState<TimeLeft | null>(null);
  const [completed, setCompleted] = useState(false);
  const color = accentColor ?? 'var(--accent-f1)';

  useEffect(() => {
    function getTimeLeft(): TimeLeft | null {
      const diff = target.getTime() - new Date().getTime();
      if (diff <= 0) { setCompleted(true); return null; }
      return {
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      };
    }
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (completed) {
    return (
      <p className={`font-display font-black uppercase tracking-widest ${
        size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : size === 'xs' ? 'text-sm' : 'text-2xl'
      }`} style={{ color }}>
        RACE DAY 🏁
      </p>
    );
  }
  if (!time) return null;

  const units = [
    { value: time.d, label: 'DAYS' },
    { value: time.h, label: 'HRS' },
    { value: time.m, label: 'MIN' },
    { value: time.s, label: 'SEC' },
  ];

  const sizeClasses = {
    xs: {
      value: 'text-base font-black',
      label: 'text-[9px]',
      colon: 'text-sm mb-1',
      gap: 'gap-0.5'
    },
    sm: {
      value: 'text-2xl md:text-3xl',
      label: 'text-[10px]',
      colon: 'text-xl md:text-2xl mb-3',
      gap: 'gap-1 md:gap-1.5'
    },
    md: {
      value: 'text-3xl md:text-5xl',
      label: 'text-sm',
      colon: 'text-2xl md:text-3xl mb-5',
      gap: 'gap-1 md:gap-2'
    },
    lg: {
      value: 'text-4xl md:text-7xl',
      label: 'text-base',
      colon: 'text-3xl md:text-5xl mb-6',
      gap: 'gap-2 md:gap-4'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-end ${currentSize.gap}`}>
      {units.map(({ value, label }, i) => (
        <div key={label} className={`flex items-end ${currentSize.gap}`}>
          {i > 0 && (
            <span className={`text-[var(--text-secondary)] font-bold select-none ${currentSize.colon}`}>:</span>
          )}
          <div className="text-center">
            <div className={`font-display font-black text-white mono-data tabular-nums ${currentSize.value}`} style={{ minWidth: '2ch' }}>
              {String(value).padStart(2, '0')}
            </div>
            <div className={`text-[var(--text-secondary)] uppercase-label tracking-widest mt-1 ${currentSize.label}`}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
