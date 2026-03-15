import Link from 'next/link';

const SUBNAV_ITEMS = [
  { label: 'Schedule',      href: 'schedule' },
  { label: 'Experiences',   href: 'experiences' },
  { label: 'Tickets',       href: 'tickets' },
  { label: 'Guide',         href: 'guide' },
  { label: 'Getting There', href: 'getting-there' },
  { label: 'Where to Stay', href: 'where-to-stay' },
  { label: 'Tips',          href: 'tips' },
];

export default function RaceSubNav({ raceSlug, series, current }: {
  raceSlug: string;
  series: string;
  current: string;
}) {
  return (
    <nav className="sticky top-14 z-30 flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-md -mx-4 px-4">
      {SUBNAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={`/${series}/${raceSlug}/${item.href}`}
          className={`px-4 py-2 text-sm font-bold whitespace-nowrap rounded-t-lg transition-colors ${
            current === item.href
              ? `text-white border-b-2 ${series === 'motogp' ? 'border-[var(--accent-motogp)]' : 'border-[var(--accent-f1)]'}`
              : 'text-[var(--text-tertiary)] hover:text-white'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
