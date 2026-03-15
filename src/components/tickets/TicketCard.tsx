'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Ticket } from '@/types/ticket';
import { useCurrency } from '@/context/CurrencyContext';
import RaceImage from '@/components/layout/RaceImage';

interface Props {
  ticket: Ticket;
  raceAccent?: string;
  index?: number;
}

export default function TicketCard({ ticket, raceAccent, index }: Props) {
  const { convertPrice } = useCurrency();
  if (!ticket.ticketUrl) return null;

  const hasPrice = ticket.priceMin !== null;
  const priceStr = hasPrice
    ? convertPrice(Number(ticket.priceMin), ticket.currency || 'USD').label
    : 'See prices';

  // Categorization helper
  const getCategoryColor = (cat: string | null) => {
    if (!cat) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    const c = cat.toLowerCase();
    if (c.includes('vip') || c.includes('premium') || c.includes('hospitality') || c.includes('paddock')) 
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (c.includes('grandstand') || c.includes('seat')) 
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (c.includes('ga') || c.includes('general') || c.includes('standing')) 
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index ?? 0) * 0.06 }}
      whileHover={{ y: -4 }}
      className="group p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-300 flex flex-col gap-4 shadow-lg hover:shadow-2xl relative overflow-hidden"
      style={{ 
        '--hover-border': raceAccent ? `${raceAccent}66` : 'var(--border-medium)',
        '--hover-shadow': raceAccent ? `0 8px 32px ${raceAccent}33` : '0 8px 32px rgba(0,0,0,0.3)'
      } as any}
    >
      {ticket.imageUrl && (
        <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden border-b border-white/5">
          <RaceImage
            src={ticket.imageUrl}
            alt={ticket.title || 'Ticket'}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            accentColor={raceAccent}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent opacity-60" />
        </div>
      )}
      {/* Category Pill */}
      <div className="flex justify-between items-start">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(ticket.category)}`}>
          {ticket.category || 'Sports'}
        </span>
        
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)] bg-[var(--accent-teal)]/10 px-2.5 py-1 rounded-lg border border-[var(--accent-teal)]/20">
          Official Partner
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-white font-bold text-lg group-hover:text-[var(--accent-teal)] transition-colors leading-tight mb-2">
          {ticket.title}
        </h3>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-white/5 text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-wider">
          <span>🎫</span> Ticketmaster
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <p className="text-2xl font-display font-black text-white">
            {hasPrice && <span className="text-xs font-bold text-[var(--text-tertiary)] mr-1 uppercase">From</span>}
            {priceStr}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold">per ticket</p>
        </div>
        
        <a
          href={`/go/ticket/${ticket.id}?src=ticket`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wider"
          style={{ 
            backgroundColor: raceAccent || 'var(--accent-f1)',
            boxShadow: raceAccent ? `0 10px 20px -5px ${raceAccent}40` : undefined
          }}
        >
          Get Tickets →
        </a>
      </div>
    </motion.div>
  );
}
