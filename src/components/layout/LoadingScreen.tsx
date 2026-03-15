'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if already shown this session
    const hasShown = sessionStorage.getItem('apex_loaded');
    if (hasShown) return;

    setIsVisible(true);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('apex_loaded', 'true');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-[#06060A] flex flex-col items-center justify-center p-6 overflow-hidden"
        >
          {/* Hex Pattern Overlay */}
          <div className="absolute inset-0 bg-apex-mesh opacity-20" />
          
          <div className="relative w-full max-w-md">
            {/* Telemetry Data Simulation */}
            <div className="flex justify-between items-end mb-2 font-mono text-[10px] text-[var(--accent-teal)] uppercase tracking-widest opacity-60">
              <div className="flex flex-col gap-1">
                <span>SYSTEM.INITIALIZE()</span>
                <span>DATA_STREAM_01: ACTIVE</span>
              </div>
              <div className="text-right">
                <span>{progress}% READY</span>
              </div>
            </div>

            {/* Main Progress Bar */}
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[var(--accent-f1)] to-[var(--accent-motogp)]"
              />
            </div>

            {/* Dynamic Accents */}
            <div className="mt-8 flex justify-center gap-12">
              <div className="text-center">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-tighter mb-1">Series_Red</p>
                <div className={`w-2 h-2 rounded-full ${progress > 30 ? 'bg-[var(--accent-f1)] shadow-[0_0_10px_var(--accent-f1)]' : 'bg-white/10'} transition-all duration-300`} />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-tighter mb-1">Series_Orng</p>
                <div className={`w-2 h-2 rounded-full ${progress > 60 ? 'bg-[var(--accent-motogp)] shadow-[0_0_10px_var(--accent-motogp)]' : 'bg-white/10'} transition-all duration-300`} />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-tighter mb-1">System_Sync</p>
                <div className={`w-2 h-2 rounded-full ${progress > 90 ? 'bg-[var(--accent-teal)] shadow-[0_0_10px_var(--accent-teal)]' : 'bg-white/10'} transition-all duration-300`} />
              </div>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 font-display font-black text-white text-2xl uppercase tracking-[0.5em] opacity-40"
          >
            RACEWEEKEND
          </motion.h1>

          {/* Scanning Line */}
          <motion.div
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[var(--accent-teal)]/5 to-transparent pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
