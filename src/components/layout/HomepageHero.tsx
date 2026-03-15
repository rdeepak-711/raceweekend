'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const F1CarSilhouette = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 600 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} drop-shadow-[0_0_30px_rgba(225,6,0,0.5)]`}>
    {/* Front wing */}
    <path d="M20 128 L20 118 L80 112 L80 128 Z" stroke="#E10600" strokeWidth="1.5" fill="#E10600" fillOpacity="0.08" />
    <path d="M20 118 L80 112" stroke="#E10600" strokeWidth="2.5" />
    {/* Rear wing endplates */}
    <rect x="500" y="62" width="8" height="52" rx="2" stroke="#E10600" strokeWidth="1.5" fill="#E10600" fillOpacity="0.08" />
    <rect x="556" y="62" width="8" height="52" rx="2" stroke="#E10600" strokeWidth="1.5" fill="#E10600" fillOpacity="0.08" />
    {/* Rear wing planes */}
    <path d="M508 68 L556 68" stroke="#E10600" strokeWidth="3" />
    <path d="M508 76 L556 76" stroke="#E10600" strokeWidth="2" />
    {/* Main body — low narrow nose tapering to wide sidepods */}
    <path d="M80 112 L130 100 L160 88 L200 82 L260 78 L340 76 L400 78 L450 82 L480 90 L500 100 L500 114 L450 116 L400 118 L260 120 L160 118 L80 128 Z"
      stroke="#E10600" strokeWidth="2" fill="#E10600" fillOpacity="0.06" />
    {/* Cockpit surround / halo */}
    <path d="M240 78 Q270 52 330 52 Q360 52 370 78" stroke="#E10600" strokeWidth="2.5" fill="none" />
    <path d="M280 78 L270 55 M340 78 L350 55" stroke="#E10600" strokeWidth="1.5" />
    {/* Sidepod intakes */}
    <path d="M200 82 L200 100 Q220 104 240 100 L240 82" stroke="#E10600" strokeWidth="1.5" fill="#E10600" fillOpacity="0.12" />
    <path d="M400 82 L400 100 Q420 104 440 100 L440 82" stroke="#E10600" strokeWidth="1.5" fill="#E10600" fillOpacity="0.12" />
    {/* Floor / diffuser */}
    <path d="M80 128 L500 114 L508 122 L80 136 Z" stroke="#E10600" strokeWidth="1" fill="#E10600" fillOpacity="0.04" />
    {/* Front wheel */}
    <ellipse cx="148" cy="136" rx="22" ry="22" stroke="#E10600" strokeWidth="2.5" fill="#E10600" fillOpacity="0.08" />
    <ellipse cx="148" cy="136" rx="10" ry="10" stroke="#E10600" strokeWidth="1.5" />
    {/* Rear wheel */}
    <ellipse cx="452" cy="134" rx="26" ry="26" stroke="#E10600" strokeWidth="2.5" fill="#E10600" fillOpacity="0.08" />
    <ellipse cx="452" cy="134" rx="12" ry="12" stroke="#E10600" strokeWidth="1.5" />
    {/* Suspension bars */}
    <path d="M126 118 L120 136 M170 118 L176 136" stroke="#E10600" strokeWidth="1.5" />
    <path d="M426 118 L420 134 M478 116 L484 134" stroke="#E10600" strokeWidth="1.5" />
  </svg>
);

const MotoGPBikeSilhouette = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 480 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} drop-shadow-[0_0_30px_rgba(255,107,0,0.5)]`}>
    {/* Rear wheel */}
    <circle cx="360" cy="162" r="48" stroke="#FF6B00" strokeWidth="2.5" fill="#FF6B00" fillOpacity="0.06" />
    <circle cx="360" cy="162" r="20" stroke="#FF6B00" strokeWidth="1.5" />
    {/* Front wheel */}
    <circle cx="90" cy="164" r="42" stroke="#FF6B00" strokeWidth="2.5" fill="#FF6B00" fillOpacity="0.06" />
    <circle cx="90" cy="164" r="18" stroke="#FF6B00" strokeWidth="1.5" />
    {/* Rear swingarm */}
    <path d="M220 148 Q290 140 360 162" stroke="#FF6B00" strokeWidth="3" fill="none" />
    {/* Main frame */}
    <path d="M160 100 L220 148 L180 148" stroke="#FF6B00" strokeWidth="3" fill="none" />
    <path d="M160 100 L200 68 L230 62" stroke="#FF6B00" strokeWidth="3" fill="none" />
    {/* Front forks */}
    <path d="M120 100 L90 164" stroke="#FF6B00" strokeWidth="3" />
    <path d="M130 98 L102 160" stroke="#FF6B00" strokeWidth="2" />
    {/* Upper fork brace / triple clamp */}
    <path d="M118 105 L132 102" stroke="#FF6B00" strokeWidth="2" />
    {/* Engine block */}
    <rect x="168" y="112" width="60" height="42" rx="6" stroke="#FF6B00" strokeWidth="1.5" fill="#FF6B00" fillOpacity="0.10" />
    {/* Fairing — aggressive nose + belly pan */}
    <path d="M120 98 Q130 60 160 100 L200 68 Q220 40 260 45 Q300 50 310 80 L330 110 Q290 120 220 148 L180 148 Q160 130 120 98 Z"
      stroke="#FF6B00" strokeWidth="2" fill="#FF6B00" fillOpacity="0.07" />
    {/* Screen / windshield */}
    <path d="M200 68 Q218 44 250 42 Q278 42 290 58 L260 45 Q240 40 220 48 Z"
      stroke="#FF6B00" strokeWidth="1.5" fill="#FF6B00" fillOpacity="0.15" />
    {/* Rider silhouette — tucked */}
    <ellipse cx="248" cy="62" rx="16" ry="14" stroke="#FF6B00" strokeWidth="1.5" fill="#FF6B00" fillOpacity="0.10" />
    <path d="M248 76 Q256 90 260 110 L230 118 Q218 96 232 76 Z" stroke="#FF6B00" strokeWidth="1.5" fill="#FF6B00" fillOpacity="0.10" />
    {/* Exhaust */}
    <path d="M310 130 Q350 125 390 138" stroke="#FF6B00" strokeWidth="2" />
    {/* Front brake disc indicator */}
    <path d="M72 148 L108 148" stroke="#FF6B00" strokeWidth="1.5" opacity="0.6" />
    {/* Rear brake disc */}
    <path d="M342 148 L378 148" stroke="#FF6B00" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

const HomepageHero = () => {
  const { scrollY } = useScroll();
  const [displayText, setDisplayText] = useState('INITIALIZING...');
  const [mounted, setMounted] = useState(false);

  // Scroll Exit Blast
  const blastOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const f1ExitX = useTransform(scrollY, [0, 100], [0, -1400]);
  const bikeExitX = useTransform(scrollY, [0, 100], [0, 1400]);
  const contentY = useTransform(scrollY, [0, 100], [0, -50]);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setDisplayText('SELECT YOUR RACE →');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const titleLetters = "RACEWEEKEND".split("");

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-[#06060A] flex flex-col items-center justify-center">
      {/* Hex Mesh Background */}
      <div className="absolute inset-0 bg-apex-mesh opacity-20 pointer-events-none" />
      
      {/* Glow Blobs */}
      <div className="absolute top-1/2 left-[-100px] -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-f1)]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-motogp)]/10 blur-[140px] rounded-full pointer-events-none" />
      
      {/* Upgraded Track Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M-100 250C200 150 400 350 720 450C1040 550 1240 350 1540 250" 
            stroke="url(#gradient-f1)" strokeWidth="1" strokeDasharray="10 10" 
          />
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            d="M-100 550C200 650 400 450 720 350C1040 250 1240 450 1540 550" 
            stroke="url(#gradient-motogp)" strokeWidth="1" strokeDasharray="10 10" 
          />
          <defs>
            <linearGradient id="gradient-f1" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="var(--accent-f1)" stopOpacity="0" />
              <stop offset="0.5" stopColor="var(--accent-f1)" />
              <stop offset="1" stopColor="var(--accent-f1)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-motogp" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="var(--accent-motogp)" stopOpacity="0" />
              <stop offset="0.5" stopColor="var(--accent-motogp)" />
              <stop offset="1" stopColor="var(--accent-motogp)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* F1 Car (Left) */}
      <motion.div 
        style={mounted ? { x: f1ExitX, opacity: blastOpacity } : { x: -700, opacity: 0 }}
        initial={{ x: -700, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.2 }}
        className="absolute left-[-50px] top-[40%] w-[350px] md:w-[600px] z-20 pointer-events-none hidden lg:block"
      >
        <div className="relative animate-float">
          <F1CarSilhouette className="w-full h-auto" />
          {/* Motion Blur Trail */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06060A] via-[#06060A]/40 to-transparent -translate-x-full" />
        </div>
      </motion.div>

      {/* MotoGP Bike (Right) */}
      <motion.div 
        style={mounted ? { x: bikeExitX, opacity: blastOpacity } : { x: 700, opacity: 0 }}
        initial={{ x: 700, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.4 }}
        className="absolute right-[-50px] top-[42%] w-[250px] md:w-[450px] z-20 pointer-events-none hidden lg:block"
      >
        <div className="relative animate-lean" style={{ transformOrigin: 'center center' }}>
          <MotoGPBikeSilhouette className="w-full h-auto" />
          {/* Motion Blur Trail */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#06060A] via-[#06060A]/40 to-transparent translate-x-full" />
        </div>
      </motion.div>

      {/* Center Content */}
      <motion.div 
        style={mounted ? { y: contentY, opacity: blastOpacity } : { y: 0, opacity: 1 }}
        className="relative z-30 max-w-5xl mx-auto px-6 text-center"
      >
        {/* Letter Stagger Headline */}
        <h1 className="flex justify-center mb-6">
          {titleLetters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 + 0.6, type: 'spring', damping: 20 }}
              className="font-display font-black text-6xl md:text-9xl text-white tracking-tighter inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </h1>
        
        {/* Typewriter Line */}
        <div className="font-mono text-[10px] md:text-xs text-[var(--accent-teal)] uppercase tracking-[0.4em] mb-12 h-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="typewriter-cursor inline-block"
            >
              SZN_2026 // 24 ROUNDS // F1 + MOTOGP // {displayText}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/f1"
            className="group relative overflow-hidden px-10 py-5 bg-[var(--accent-f1)] text-white font-black uppercase tracking-[0.2em] text-xs rounded-sm transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[var(--accent-f1)]/40"
          >
            <span className="relative z-10">Explore F1 Series [S1]</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
          </Link>
          <Link 
            href="/motogp"
            className="group relative overflow-hidden px-10 py-5 bg-[var(--accent-motogp)] text-white font-black uppercase tracking-[0.2em] text-xs rounded-sm transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[var(--accent-motogp)]/40"
          >
            <span className="relative z-10">Explore MotoGP [S2]</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
          </Link>
        </div>
      </motion.div>

      {/* Scroll Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-[var(--text-tertiary)] text-[8px] uppercase tracking-[0.5em] font-bold">SCROLL_FOR_TELEMETRY</p>
          <div className="w-px h-16 bg-gradient-to-b from-[var(--accent-teal)] to-transparent" />
        </div>
      </motion.div>
    </section>
  );
};

export default HomepageHero;
