import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { getRacesBySeries } from '@/services/race.service';
import { SITE_URL, BASE_OG } from '@/lib/constants/site';
import { db } from '@/lib/db';
import { experiences } from '@/lib/db/schema';

export const metadata: Metadata = {
  title: 'Sitemap | Race Weekend',
  description: 'Complete directory of all Formula 1 and MotoGP races, ticket listings, and local experiences on Race Weekend.',
  alternates: { canonical: `${SITE_URL}/site-directory` },
  openGraph: {
    ...BASE_OG,
    title: 'Sitemap | Race Weekend',
    description: 'Complete directory of all Formula 1 and MotoGP races, ticket listings, and local experiences on Race Weekend.',
    url: `${SITE_URL}/site-directory`,
  },
};

// TODAY is computed inside the component (after connection() via getRacesBySeries)
const STATIC_PAGES_FIXED = [
  { path: '/about',          label: 'About',            lastMod: '2025-01-01' },
  { path: '/contact',        label: 'Contact',          lastMod: '2025-01-01' },
  { path: '/privacy',        label: 'Privacy Policy',   lastMod: '2025-01-01' },
  { path: '/terms',          label: 'Terms of Service', lastMod: '2025-01-01' },
];

const RACE_SUBS: { sub: string; label: string }[] = [
  { sub: '',               label: 'Race Overview' },
  { sub: '/schedule',      label: 'Weekend Schedule' },
  { sub: '/experiences',   label: 'Local Experiences' },
  { sub: '/guide',         label: 'City Guide' },
  { sub: '/getting-there', label: 'Getting There' },
  { sub: '/where-to-stay', label: 'Where to Stay' },
  { sub: '/tips',          label: 'Race Tips' },
];

interface UrlEntry {
  url: string;
  label: string;
  lastMod: string;
  section: string;
}

export default async function SiteDirectoryPage() {
  await connection();

  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);
  const TODAY =
    f1Races[f1Races.length - 1]?.raceDate ??
    motogpRaces[motogpRaces.length - 1]?.raceDate ??
    '2026-01-01';
  const experienceRows = await db
    .select({
      slug: experiences.slug,
      raceId: experiences.race_id,
      title: experiences.title,
      updatedAt: experiences.updated_at,
    })
    .from(experiences);

  const STATIC_PAGES = [
    { path: '/',               label: 'Home',             lastMod: TODAY },
    { path: '/f1',             label: 'F1 2026 Calendar', lastMod: TODAY },
    { path: '/motogp',         label: 'MotoGP 2026 Calendar', lastMod: TODAY },
    { path: '/itinerary',      label: 'Itinerary Builder', lastMod: TODAY },
    { path: '/site-directory', label: 'Site Directory',   lastMod: TODAY },
    ...STATIC_PAGES_FIXED,
  ];

  // Build flat list of all URLs with accurate lastModified
  const entries: UrlEntry[] = [];

  // Static pages
  for (const p of STATIC_PAGES) {
    entries.push({ url: `${SITE_URL}${p.path}`, label: p.label, lastMod: p.lastMod, section: 'Main Pages' });
  }

  // F1 race pages — lastMod = raceDate (content is tied to that event)
  for (const race of f1Races) {
    for (const { sub, label } of RACE_SUBS) {
      entries.push({
        url: `${SITE_URL}/f1/${race.slug}${sub}`,
        label: `${race.flagEmoji ?? ''} ${race.name} — ${label}`.trim(),
        lastMod: race.raceDate,
        section: 'F1 2026',
      });
    }
  }

  // MotoGP race pages
  for (const race of motogpRaces) {
    for (const { sub, label } of RACE_SUBS) {
      entries.push({
        url: `${SITE_URL}/motogp/${race.slug}${sub}`,
        label: `${race.flagEmoji ?? ''} ${race.name} — ${label}`.trim(),
        lastMod: race.raceDate,
        section: 'MotoGP 2026',
      });
    }
  }

  const raceMap = new Map<number, { slug: string; series: 'f1' | 'motogp'; raceDate: string }>();
  for (const race of f1Races) raceMap.set(race.id, { slug: race.slug, series: 'f1', raceDate: race.raceDate });
  for (const race of motogpRaces) raceMap.set(race.id, { slug: race.slug, series: 'motogp', raceDate: race.raceDate });

  for (const exp of experienceRows) {
    if (!exp.slug || !exp.raceId) continue;
    const raceInfo = raceMap.get(exp.raceId);
    if (!raceInfo) continue;
    entries.push({
      url: `${SITE_URL}/${raceInfo.series}/${raceInfo.slug}/experiences/${exp.slug}`,
      label: `${exp.title || exp.slug} — Experience Detail`,
      lastMod: exp.updatedAt ? new Date(exp.updatedAt).toISOString().slice(0, 10) : raceInfo.raceDate,
      section: 'Experience Details',
    });
  }

  const totalUrls = entries.length;
  const lastUpdated = TODAY;

  // Group entries by section for display
  const sections = ['Main Pages', 'F1 2026', 'MotoGP 2026', 'Experience Details'] as const;
  const grouped = sections.map(section => ({
    section,
    entries: entries.filter(e => e.section === section),
  }));

  // Running index across all sections
  let globalIdx = 0;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Race Weekend — All Pages',
    description: 'Complete directory of all Formula 1 and MotoGP races, schedules, and travel guides on Race Weekend.',
    numberOfItems: totalUrls,
    itemListElement: entries.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entry.label,
      url: entry.url,
    })),
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-32 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Stats header */}
        <div className="grid grid-cols-2 gap-px bg-[var(--border-subtle)] rounded-2xl overflow-hidden mb-10 border border-[var(--border-subtle)]">
          <div className="bg-[var(--bg-secondary)] px-8 py-7">
            <p className="text-4xl font-black text-indigo-400 tabular-nums">{totalUrls.toLocaleString()}</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Total URLs</p>
          </div>
          <div className="bg-[var(--bg-secondary)] px-8 py-7">
            <p className="text-4xl font-black text-indigo-400 tabular-nums">{lastUpdated}</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Last Updated</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-secondary)]">

          {/* Table heading */}
          <div className="flex items-center gap-3 px-6 py-5 border-b-2 border-indigo-500/60">
            <h1 className="font-black text-lg text-white">All URLs</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[11px] font-black uppercase tracking-wider">
              Sitemap
            </span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[3rem_1fr_9rem] gap-4 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/40">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">#</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">URL &amp; Page</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] text-right">Last Modified</span>
          </div>

          {grouped.map(({ section, entries: sectionEntries }) => (
            <div key={section}>
              {/* Section separator */}
              <div className="px-6 py-2.5 bg-[var(--bg-primary)]/60 border-b border-[var(--border-subtle)]">
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">{section}</span>
              </div>

              {sectionEntries.map((entry) => {
                globalIdx++;
                const n = globalIdx;
                const path = entry.url.replace(SITE_URL, '');
                return (
                  <div
                    key={entry.url}
                    className="grid grid-cols-[3rem_1fr_9rem] gap-4 px-6 py-3.5 border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* # */}
                    <span className="text-sm font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors pt-0.5">
                      {n}
                    </span>

                    {/* URL */}
                    <div className="min-w-0">
                      <Link
                        href={path}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors break-all leading-snug"
                      >
                        {entry.url}
                      </Link>
                      <p className="text-[var(--text-tertiary)] text-xs mt-0.5 leading-tight">{entry.label}</p>
                    </div>

                    {/* Last modified */}
                    <span className="text-sm font-mono text-[var(--text-secondary)] text-right pt-0.5 tabular-nums">
                      {entry.lastMod}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <p className="text-center text-[var(--text-tertiary)] text-xs mt-8">
          {totalUrls} indexed pages · experience detail pages are listed in{' '}
          <Link href="/sitemap.xml" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            sitemap.xml
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}
