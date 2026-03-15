'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ticket } from '@/types/ticket';
import TicketCard from './TicketCard';
import TicketSidebarCTA from './TicketSidebarCTA';

interface TicketsClientProps {
  tickets: Ticket[];
  raceAccent: string;
}

export default function TicketsClient({ tickets, raceAccent }: TicketsClientProps) {
  const cheapestTicket = useMemo(() => {
    if (tickets.length === 0) return null;
    return [...tickets].sort((a, b) => (a.priceMin || Infinity) - (b.priceMin || Infinity))[0];
  }, [tickets]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1 w-full">
        {/* Tickets Grid */}
        {tickets.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {tickets.map((ticket, idx) => (
                <TicketCard 
                  key={String(ticket.id)} 
                  ticket={ticket} 
                  raceAccent={raceAccent}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)]">
            <p className="text-4xl mb-4">🎟️</p>
            <p className="text-lg text-[var(--text-secondary)]">No tickets found for this race.</p>
          </div>
        )}
      </div>

      {/* Sidebar CTA */}
      {cheapestTicket && (
        <TicketSidebarCTA 
          cheapestPrice={cheapestTicket.priceMin || 0}
          currency={cheapestTicket.currency || 'USD'}
          listingCount={tickets.length}
          ticketUrl={cheapestTicket.ticketUrl || ''}
          updatedAt={cheapestTicket.lastSyncedAt?.toISOString() || new Date().toISOString()}
          raceAccent={raceAccent}
        />
      )}
    </div>
  );
}
