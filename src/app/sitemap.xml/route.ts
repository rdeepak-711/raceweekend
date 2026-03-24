import { NextResponse } from 'next/server';
import { getRacesBySeries } from '@/services/race.service';
import { db } from '@/lib/db';
import { experiences, race_content } from '@/lib/db/schema';
import { getAllPublishedBlogPosts } from '@/services/blog.service';
import { SITE_URL } from '@/lib/constants/site';

const BASE = SITE_URL;
const SITE_LAUNCH = '2025-01-01T00:00:00.000Z';

const STATIC_PAGES = [
  { path: '/',               changefreq: 'daily',   priority: 1.0,  dynamic: true  },
  { path: '/f1',             changefreq: 'weekly',  priority: 0.9,  dynamic: true  },
  { path: '/motogp',         changefreq: 'weekly',  priority: 0.9,  dynamic: true  },
  { path: '/itinerary',      changefreq: 'monthly', priority: 0.7,  dynamic: false },
  { path: '/site-directory', changefreq: 'weekly',  priority: 0.4,  dynamic: true  },
  { path: '/about',          changefreq: 'monthly', priority: 0.3,  dynamic: false },
  { path: '/contact',        changefreq: 'monthly', priority: 0.3,  dynamic: false },
  { path: '/privacy',        changefreq: 'yearly',  priority: 0.2,  dynamic: false },
  { path: '/terms',          changefreq: 'yearly',  priority: 0.2,  dynamic: false },
] as const;

const RACE_SUBS = [
  { sub: '',               changefreq: 'daily',   priority: 0.95 },
  { sub: '/schedule',      changefreq: 'weekly',  priority: 0.8  },
  { sub: '/experiences',   changefreq: 'daily',   priority: 0.9  },
  { sub: '/tickets',       changefreq: 'weekly',  priority: 0.8  },
  { sub: '/guide',         changefreq: 'monthly', priority: 0.85 },
  { sub: '/getting-there', changefreq: 'monthly', priority: 0.7  },
  { sub: '/where-to-stay', changefreq: 'monthly', priority: 0.7  },
  { sub: '/tips',          changefreq: 'monthly', priority: 0.7  },
] as const;

const CONTENT_GATED_SUBS = new Set(['/getting-there', '/where-to-stay', '/tips']);

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: number): string {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function hasNonEmptyText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseJsonField<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

export async function GET() {
  const now = new Date().toISOString();

  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  const entries: string[] = [];
  const seenUrls = new Set<string>();
  let contentAvailability:
    | {
        gettingThereRaceIds: Set<number>;
        whereToStayRaceIds: Set<number>;
        tipsRaceIds: Set<number>;
      }
    | null = null;

  function addUrl(loc: string, lastmod: string, changefreq: string, priority: number) {
    if (seenUrls.has(loc)) return;
    seenUrls.add(loc);
    entries.push(urlEntry(loc, lastmod, changefreq, priority));
  }

  // Static pages
  for (const p of STATIC_PAGES) {
    addUrl(`${BASE}${p.path}`, p.dynamic ? now : SITE_LAUNCH, p.changefreq, p.priority);
  }

  // Blog pages
  try {
    const blogPostList = await getAllPublishedBlogPosts();
    addUrl(`${BASE}/blog`, now, 'weekly', 0.7);
    for (const post of blogPostList) {
      const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString() : now;
      addUrl(`${BASE}/blog/${post.slug}`, lastmod, 'weekly', 0.6);
    }
  } catch {
    // DB not available during build — blog pages omitted
  }

  // Determine which race content sub-pages are indexable per race.
  try {
    const contentRows = await db
      .select({
        raceId: race_content.race_id,
        gettingThere: race_content.getting_there,
        gettingThereIntro: race_content.getting_there_intro,
        transportOptions: race_content.transport_options,
        whereToStay: race_content.where_to_stay,
        travelTips: race_content.travel_tips,
        tipsContent: race_content.tips_content,
        faqItems: race_content.faq_items,
        circuitFacts: race_content.circuit_facts,
      })
      .from(race_content);

    const gettingThereRaceIds = new Set<number>();
    const whereToStayRaceIds = new Set<number>();
    const tipsRaceIds = new Set<number>();

    for (const row of contentRows) {
      const travelTips = parseJsonField<Array<unknown>>(row.travelTips) ?? [];
      const transportOptions = parseJsonField<Array<unknown>>(row.transportOptions) ?? [];
      const faqItems = parseJsonField<Array<unknown>>(row.faqItems) ?? [];
      const circuitFacts = parseJsonField<Record<string, unknown>>(row.circuitFacts) ?? {};

      const hasGettingThere = hasNonEmptyText(row.gettingThere) || hasNonEmptyText(row.gettingThereIntro) || transportOptions.length > 0;
      const hasWhereToStay = hasNonEmptyText(row.whereToStay) || travelTips.length > 0;
      const hasTips = hasNonEmptyText(row.tipsContent) || travelTips.length > 0 || faqItems.length > 0 || Object.keys(circuitFacts).length > 0;

      if (hasGettingThere) gettingThereRaceIds.add(row.raceId);
      if (hasWhereToStay) whereToStayRaceIds.add(row.raceId);
      if (hasTips) tipsRaceIds.add(row.raceId);
    }

    contentAvailability = { gettingThereRaceIds, whereToStayRaceIds, tipsRaceIds };
  } catch {
    // DB not available during build — include full race sub-page set
  }

  // Race pages — lastmod = race date
  for (const { races, series } of [
    { races: f1Races, series: 'f1' },
    { races: motogpRaces, series: 'motogp' },
  ]) {
    for (const race of races) {
      const lastmod = new Date(race.raceDate).toISOString();
      for (const sub of RACE_SUBS) {
        if (contentAvailability && CONTENT_GATED_SUBS.has(sub.sub)) {
          if (sub.sub === '/getting-there' && !contentAvailability.gettingThereRaceIds.has(race.id)) continue;
          if (sub.sub === '/where-to-stay' && !contentAvailability.whereToStayRaceIds.has(race.id)) continue;
          if (sub.sub === '/tips' && !contentAvailability.tipsRaceIds.has(race.id)) continue;
        }
        addUrl(`${BASE}/${series}/${race.slug}${sub.sub}`, lastmod, sub.changefreq, sub.priority);
      }
    }
  }

  // Experience detail pages — lastmod = experience.updated_at or race date
  const raceMap = new Map<number, { slug: string; series: string; raceDate: string }>();
  for (const race of f1Races) raceMap.set(race.id, { slug: race.slug, series: 'f1', raceDate: race.raceDate });
  for (const race of motogpRaces) raceMap.set(race.id, { slug: race.slug, series: 'motogp', raceDate: race.raceDate });

  try {
    const allExps = await db
      .select({
        slug: experiences.slug,
        raceId: experiences.race_id,
        isFeatured: experiences.is_featured,
        updatedAt: experiences.updated_at,
      })
      .from(experiences);

    for (const exp of allExps) {
      const raceInfo = exp.raceId ? raceMap.get(exp.raceId) : null;
      if (!raceInfo || !exp.slug) continue;
      const lastmod = exp.updatedAt
        ? new Date(exp.updatedAt).toISOString()
        : new Date(raceInfo.raceDate).toISOString();
      addUrl(
        `${BASE}/${raceInfo.series}/${raceInfo.slug}/experiences/${exp.slug}`,
        lastmod,
        'weekly',
        exp.isFeatured ? 0.85 : 0.75,
      );
    }
  } catch {
    // DB not available during build — experience pages omitted
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
