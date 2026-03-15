'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const panels = [
  {
    id: '01',
    label: 'THE CIRCUIT',
    title: 'TRACK ATMOSPHERE',
    desc: 'Immerse yourself in the high-speed drama of 24 global circuits.',
    points: ['Live Session Status', 'Corner-by-Corner Details', 'Weather Telemetry'],
    icon: '🏁',
    color: 'var(--accent-f1)'
  },
  {
    id: '02',
    label: 'EXPERIENCE',
    title: 'LOCAL ENERGY',
    desc: 'Curated experiences that capture the soul of the race city.',
    points: ['Grandstand Culture', 'Pit Lane Dining', 'After-Hours Events'],
    icon: '📍',
    color: 'var(--accent-teal)'
  },
  {
    id: '03',
    label: 'LOGISTICS',
    title: 'GETTING THERE',
    desc: 'Battle-tested travel logistics for seamless arrival and departure.',
    points: ['Paddock Transfers', 'Public Transit Routes', 'Airport Connections'],
    icon: '✈️',
    color: 'var(--accent-motogp)'
  },
  {
    id: '04',
    label: 'INTELLIGENCE',
    title: 'INSIDER TIPS',
    desc: 'Classified briefings for the ultimate trackside advantage.',
    points: ['Best Viewing Angles', 'Gate Entry Strategies', 'Radio Frequency Sync'],
    icon: '📡',
    color: 'var(--color-data-green)'
  },
  {
    id: '05',
    label: 'ACCESS',
    title: 'PODIUM TICKETS',
    desc: 'Secure your place in the stands with live market intelligence.',
    points: ['Live Price Tracking', 'Official Partners Only', 'Secure Checkout'],
    icon: '🎟️',
    color: 'var(--accent-f1)'
  }
];

const FeatureRevealStrip = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({
    container: containerRef
  });

  return (
    <section className="relative py-24 bg-[var(--bg-secondary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
        <div>
          <span className="text-[var(--accent-teal)] font-mono text-[10px] uppercase tracking-[0.4em] mb-2 block">Feature_Matrix_v1.0</span>
          <h2 className="font-display font-black text-4xl text-white uppercase tracking-tighter">THE COMMAND CENTER</h2>
        </div>
        <div className="hidden md:flex gap-2">
          {panels.map((_, i) => (
            <div key={i} className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                style={{ 
                  scaleX: useTransform(scrollXProgress, [i * 0.2, (i + 1) * 0.2], [0, 1]),
                  originX: 0 
                }} 
                className="h-full bg-[var(--accent-teal)]" 
              />
            </div>
          ))}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 px-6 pb-12"
      >
        {panels.map((panel) => (
          <div 
            key={panel.id}
            className="flex-none w-[85vw] md:w-[450px] aspect-[4/5] md:aspect-[3/4] snap-start relative group"
          >
            <div className="absolute inset-0 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden group-hover:border-[var(--accent-teal)]/30 transition-colors">
              {/* Watermark Label */}
              <div className="absolute top-8 right-8 font-display font-black text-8xl text-white/[0.03] uppercase pointer-events-none group-hover:text-[var(--accent-teal)]/5 transition-colors">
                {panel.id}
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="mb-6">
                  <span 
                    className="inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-4 border"
                    style={{ borderColor: `${panel.color}40`, color: panel.color, backgroundColor: `${panel.color}10` }}
                  >
                    {panel.label}
                  </span>
                  <div className="text-4xl mb-4">{panel.icon}</div>
                  <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-3">
                    {panel.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                    {panel.desc}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  {panel.points.map((point, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: panel.color }} />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureRevealStrip;
