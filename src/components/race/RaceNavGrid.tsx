'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  desc: string;
}

interface RaceNavGridProps {
  raceSlug: string;
  series: string;
  accentColor: string;
  hasTickets?: boolean;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { href: 'schedule',      label: 'Schedule',      icon: '📅', desc: 'All sessions + times' },
  { href: 'experiences',   label: 'Experiences',   icon: '🗺', desc: 'Things to do nearby' },
  { href: 'tickets',       label: 'Tickets',       icon: '🎟', desc: 'Ticketmaster listings' },
  { href: 'guide',         label: 'City Guide',    icon: '📖', desc: 'Travel tips & info' },
  { href: 'getting-there', label: 'Getting There', icon: '✈️', desc: 'Transport & airport' },
  { href: 'where-to-stay', label: 'Where to Stay', icon: '🏨', desc: 'Best neighborhoods' },
];

export default function RaceNavGrid({ raceSlug, series, accentColor, hasTickets = true }: RaceNavGridProps) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
      {DEFAULT_NAV_ITEMS.map(({ href, label, icon, desc }) => (
        <Link
          key={href}
          href={`/${series}/${raceSlug}/${href}`}
          className="group relative p-5 rounded-2xl border bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300 shadow-lg"
          style={{
            borderColor: hoveredHref === href ? accentColor : 'var(--border-subtle)',
          }}
          onMouseEnter={() => setHoveredHref(href)}
          onMouseLeave={() => setHoveredHref(null)}
        >
          {href === 'tickets' && hasTickets && (
            <span className="absolute top-3 right-3 text-sm animate-bounce" title="Tickets Available">🔥</span>
          )}
          
          <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</span>
          <p className="font-display font-bold text-white text-base group-hover:text-white transition-colors">{label}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 hidden sm:block leading-relaxed">{desc}</p>
          
          <div 
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: accentColor }}
          >
            →
          </div>
        </Link>
      ))}
    </div>
  );
}
