'use client';

import React, { useEffect, useState } from 'react';
import type { OpenF1Weather } from '@/lib/api/openf1';

export default function LiveWeather({ sessionKey }: { sessionKey: number }) {
  const [weather, setWeather] = useState<OpenF1Weather | null>(null);

  const fetchWeather = async () => {
    try {
      const res = await fetch(`/api/openf1/weather?sessionKey=${sessionKey}`);
      const json = await res.json();
      if (json.data) setWeather(json.data);
    } catch {}
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // 60s updates
    return () => clearInterval(interval);
  }, [sessionKey]);

  if (!weather) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-[var(--bg-secondary)] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-2xl font-display font-black italic">AIR</div>
        <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Air_Temp</p>
        <p className="text-2xl font-display font-black text-white italic">{weather.air_temperature}°C</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-2xl font-display font-black italic">TRK</div>
        <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Track_Temp</p>
        <p className="text-2xl font-display font-black text-white italic">{weather.track_temperature}°C</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-2xl font-display font-black italic">WND</div>
        <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Wind_Spd</p>
        <p className="text-2xl font-display font-black text-white italic">{weather.wind_speed} <span className="text-xs">m/s</span></p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-2xl font-display font-black italic">CND</div>
        <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Surface</p>
        <div className="flex items-center gap-2">
          <p className={`text-2xl font-display font-black italic ${weather.rainfall ? 'text-blue-400' : 'text-green-400'}`}>
            {weather.rainfall ? 'WET' : 'DRY'}
          </p>
          {weather.rainfall > 0 && <span className="animate-bounce">🌧️</span>}
        </div>
      </div>
    </div>
  );
}
