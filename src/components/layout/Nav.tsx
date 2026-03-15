'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Race } from '@/types/race';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeriesContext } from '@/context/SeriesContext';
import { useCurrency } from '@/context/CurrencyContext';

interface NavProps {
  upcomingF1: Race[];
  upcomingMotogp: Race[];
}

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const options: Array<'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'JPY'> = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/5 text-[10px] font-black text-[var(--text-secondary)] hover:text-white transition-colors uppercase tracking-widest"
      >
        <span>{currency}</span>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 py-2 bg-[#06060A] border border-white/10 rounded shadow-2xl z-[70] min-w-[80px]"
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { setCurrency(opt); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2 text-[10px] font-black tracking-widest hover:bg-white/5 transition-colors ${currency === opt ? 'text-[var(--accent-teal)]' : 'text-[var(--text-tertiary)]'}`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Countdown = ({ targetDate, city }: { targetDate: string; city: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="hidden md:flex items-center gap-4 font-mono text-[10px] tracking-widest text-[var(--text-secondary)] bg-black/40 px-4 py-1.5 rounded-sm border border-white/5">
      <span className="text-[var(--accent-teal)] font-black">NEXT: {city.toUpperCase()} GP</span>
      <div className="flex gap-2 text-white font-bold">
        <span>{timeLeft.d}D</span>
        <span>{timeLeft.h.toString().padStart(2, '0')}H</span>
        <span>{timeLeft.m.toString().padStart(2, '0')}M</span>
        <span className="text-[var(--accent-f1)] w-[2ch]">{timeLeft.s.toString().padStart(2, '0')}S</span>
      </div>
    </div>
  );
};

export default function Nav({ upcomingF1, upcomingMotogp }: NavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { activeSeries } = useSeriesContext();

  const currentRaces = activeSeries === 'f1' ? upcomingF1 : upcomingMotogp;
  const nextRace = currentRaces[0];

  const SECTORS = [
    { href: '/', label: 'HOME', id: 'S1' },
    { href: '/f1', label: 'F1', id: 'S2' },
    { href: '/motogp', label: 'MOTOGP', id: 'S3' },
    { href: '/itinerary', label: 'ITINERARY', id: 'S4' },
    { href: '/about', label: 'ABOUT', id: 'S5' },
    { href: '/contact', label: 'CONTACT', id: 'S6' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#06060A]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display font-black text-xl tracking-[-0.1em] text-white uppercase italic group flex-shrink-0"
          >
            RACE<span className="text-[var(--accent-teal)] group-hover:text-white transition-colors">WEEKEND</span>
            <span className="ml-2 text-[10px] font-mono not-italic tracking-normal opacity-40">v1.0</span>
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {SECTORS.map((sector) => {
              const isActive = pathname === sector.href || (sector.href !== '/' && pathname.startsWith(sector.href));
              return (
                <Link
                  key={sector.id}
                  href={sector.href}
                  aria-label={`Go to ${sector.label} sector`}
                  className={`relative px-3 py-2 text-[10px] font-black tracking-[0.2em] transition-colors group ${
                    isActive ? 'text-[var(--accent-teal)]' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {sector.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--accent-f1)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Countdown — switches based on homepage calendar tab */}
        <div className="hidden md:flex items-center gap-6">
          {nextRace && <Countdown targetDate={nextRace.raceDate} city={nextRace.city} />}
          <CurrencySelector />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-white/5 rounded-sm border border-white/5"
        >
          <div className={`w-5 h-0.5 bg-white transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-[#06060A] border-b border-white/5 p-6 shadow-2xl z-50"
          >
            <div className="grid grid-cols-1 gap-3">
              {SECTORS.map((sector) => (
                <Link
                  key={sector.id}
                  href={sector.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm"
                >
                  <span className="text-xs font-black tracking-widest text-white uppercase">{sector.label}</span>
                  <span className="text-[var(--accent-teal)]">→</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
