'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

export default function ErrorState({ error, reset }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 relative inline-block"
        >
          <div className="text-8xl mb-4">🚨</div>
          <div className="absolute inset-0 bg-red-500 blur-[60px] opacity-20 animate-pulse" />
        </motion.div>

        <h1 className="font-display font-black text-4xl md:text-5xl text-white uppercase italic tracking-tighter leading-none mb-4">
          Unscheduled Pit Stop
        </h1>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <p className="text-[var(--text-secondary)] text-sm uppercase tracking-wider leading-relaxed">
            We&apos;ve lost telemetry from this sector. Our engineers are investigating the technical failure.
          </p>
          {error?.digest && (
            <p className="mt-4 font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">
              Error_Code: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {reset && (
            <button
              onClick={() => reset()}
              className="flex-1 px-8 py-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              Re-initialize Comms
            </button>
          )}
          <Link
            href="/"
            className="flex-1 px-8 py-4 rounded-xl border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-white/5 transition-all"
          >
            Return to Paddock
          </Link>
        </div>
      </div>
    </div>
  );
}
