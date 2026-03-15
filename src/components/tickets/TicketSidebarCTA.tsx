'use client';

import React from 'react';

interface TicketSidebarCTAProps {
  cheapestPrice: number;
  currency: string;
  listingCount: number;
  ticketUrl: string;
  updatedAt: string;
  raceAccent?: string;
}

const TicketSidebarCTA = ({ 
  cheapestPrice, 
  currency, 
  listingCount, 
  ticketUrl, 
  updatedAt,
  raceAccent
}: TicketSidebarCTAProps) => {
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(cheapestPrice);

  // Time ago calculation
  const updatedDate = new Date(updatedAt);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
  const timeAgoText = diffHours === 0 ? 'Just now' : `${diffHours}h ago`;

  return (
    <div className="sticky top-24 hidden lg:block w-80 shrink-0">
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl">
        <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
          <p className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest mb-1">Starting from</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-white">{formattedPrice}</span>
            <span className="text-[var(--text-secondary)] text-sm">per person</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Ticket Source</span>
            <span className="text-white font-bold">Ticketmaster</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Available Events</span>
            <span className="text-white font-bold">{listingCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Updated</span>
            <span className="text-[var(--text-tertiary)]">{timeAgoText}</span>
          </div>
        </div>

        <a 
          href={ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-xl text-white font-black text-center transition-all hover:scale-102 active:scale-98 shadow-lg uppercase tracking-wider"
          style={{ 
            backgroundColor: raceAccent || 'var(--accent-f1)',
            boxShadow: raceAccent ? `0 10px 30px -5px ${raceAccent}40` : undefined
          }}
        >
          View on Ticketmaster →
        </a>

        <p className="text-[var(--text-tertiary)] text-[10px] text-center mt-4 leading-tight">
          Prices and availability are subject to change on Ticketmaster.
        </p>
      </div>

      <div className="mt-6 p-4 rounded-xl border border-[var(--accent-teal)]/20 bg-[var(--accent-teal-muted)]">
        <div className="flex gap-3">
          <span className="text-xl">🎟️</span>
          <div>
            <p className="text-white font-bold text-xs">Official Tickets</p>
            <p className="text-[var(--text-secondary)] text-[10px] mt-0.5">Secure your race weekend experience through our official partner.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSidebarCTA;
