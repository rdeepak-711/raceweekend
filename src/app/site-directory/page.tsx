import type { Metadata } from 'next';
import Link from 'next/link';
import { getRacesBySeries } from '@/services/race.service';

export const metadata: Metadata = {
  title: 'Sitemap | Race Weekend',
  description: 'Complete directory of all Formula 1 and MotoGP races, ticket listings, and local experiences on Race Weekend.',
  alternates: { canonical: 'https://raceweekend.app/site-directory' },
};

const RACE_SECTIONS = [
  { label: 'Overview', sub: '' },
  { label: 'Full Schedule', sub: '/schedule' },
  { label: 'Local Experiences', sub: '/experiences' },
  { label: 'Race Tickets', sub: '/tickets' },
  { label: 'City Guide', sub: '/guide' },
  { label: 'Travel Guide', sub: '/travel-guide' },
  { label: 'Getting There', sub: '/getting-there' },
  { label: 'Where to Stay', sub: '/where-to-stay' },
  { label: 'Race Tips', sub: '/tips' },
];

export default async function SitemapPage() {
  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-32 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-4">Directory</p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white uppercase italic tracking-tighter leading-tight">
            Site Map
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* F1 Section */}
          <section>
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
              <span className="text-3xl">🏎️</span>
              <h2 className="font-display font-black text-3xl text-white uppercase italic">Formula 1</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {f1Races.map((race) => (
                <div key={race.slug} className="space-y-3">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{race.name}</h3>
                  <ul className="space-y-1.5 pl-1">
                    {RACE_SECTIONS.map((section) => (
                      <li key={section.sub}>
                        <Link 
                          href={`/f1/${race.slug}${section.sub}`}
                          className="text-[var(--text-secondary)] hover:text-[var(--accent-teal)] text-sm transition-colors"
                        >
                          {section.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* MotoGP Section */}
          <section>
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
              <span className="text-3xl">🏍️</span>
              <h2 className="font-display font-black text-3xl text-white uppercase italic">MotoGP</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {motogpRaces.map((race) => (
                <div key={race.slug} className="space-y-3">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{race.name}</h3>
                  <ul className="space-y-1.5 pl-1">
                    {RACE_SECTIONS.map((section) => (
                      <li key={section.sub}>
                        <Link 
                          href={`/motogp/${race.slug}${section.sub}`}
                          className="text-[var(--text-secondary)] hover:text-[var(--accent-teal)] text-sm transition-colors"
                        >
                          {section.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Static Pages */}
        <section className="mt-20 pt-12 border-t border-white/5">
          <h2 className="font-display font-black text-2xl text-white uppercase italic mb-8 tracking-tight">Main Pages</h2>
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            {[
              { label: 'Home', href: '/' },
              { label: 'Formula 1 Hub', href: '/f1' },
              { label: 'MotoGP Hub', href: '/motogp' },
              { label: 'Itinerary Builder', href: '/itinerary' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
            ].map((page) => (
              <Link 
                key={page.href}
                href={page.href}
                className="text-[var(--text-secondary)] hover:text-[var(--accent-teal)] font-bold transition-colors"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
