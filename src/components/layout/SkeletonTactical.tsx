'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SkeletonTactical({ message = 'INITIALIZING_SYSTEM_STREAM...' }: { message?: string }) {
  return (
    <div className="w-full h-96 bg-[var(--bg-secondary)] rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Scanning line animation */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 w-full h-px bg-[var(--accent-teal)]/20 shadow-[0_0_15px_var(--accent-teal)] z-10 pointer-events-none"
      />
      
      {/* Background grid dots */}
      <div className="absolute inset-0 bg-apex-mesh opacity-20" />

      <div className="relative z-20 flex flex-col items-center gap-6">
        {/* Pulsing hex/circle element */}
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full border-2 border-[var(--accent-teal)] flex items-center justify-center"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-ping" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-[10px] text-[var(--accent-teal)] uppercase tracking-[0.5em] animate-pulse">
            {message}
          </p>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                className="w-8 h-1 bg-[var(--accent-teal)]/40 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Edge corner marks */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/10" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/10" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/10" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/10" />
    </div>
  );
}
