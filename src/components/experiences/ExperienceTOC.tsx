'use client';

import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  label: string;
}

const ITEMS: TOCItem[] = [
  { id: 'photos',      label: 'Photos' },
  { id: 'overview',    label: 'Overview' },
  { id: 'highlights',  label: 'Highlights' },
  { id: 'includes',    label: 'What\'s Included' },
  { id: 'itinerary',   label: 'Itinerary' },
  { id: 'reviews',     label: 'Reviews' },
  { id: 'faq',         label: 'FAQ' },
  { id: 'booking',     label: 'Booking' },
];

export default function ExperienceTOC({ accentColor = 'var(--accent-teal)' }: { accentColor?: string }) {
  const [active, setActive] = useState('overview');
  const [available, setAvailable] = useState<TOCItem[]>([]);

  useEffect(() => {
    // Determine which items are available on mount
    const found = ITEMS.filter(item => document.getElementById(item.id) !== null);
    setAvailable(found);

    const observers: IntersectionObserver[] = [];
    found.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(item.id); },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (available.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden lg:block w-48 shrink-0">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">Contents</p>
      <ul className="space-y-1">
        {available.map(item => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className={`w-full text-left text-sm pl-3 py-1.5 rounded-r-lg transition-all border-l-2 ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border-transparent'
                }`}
                style={isActive ? { borderColor: accentColor, color: accentColor } : { borderColor: 'transparent' }}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
