import { db } from '@/lib/db';
import { experiences, experience_windows, experience_windows_map } from '@/lib/db/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import type { Experience, ExperienceFilter } from '@/types/experience';

function mapExperience(row: typeof experiences.$inferSelect): Experience {
  return {
    id: row.id,
    raceId: row.race_id ?? 0,
    title: row.title ?? '',
    slug: row.slug ?? '',
    description: row.description ?? '',
    shortDescription: row.short_description ?? '',
    abstract: row.abstract ?? null,
    category: (row.category ?? 'culture') as Experience['category'],
    durationHours: row.duration_hours ? Number(row.duration_hours) : 0,
    durationLabel: row.duration_label ?? '',
    priceAmount: row.price_amount ? Number(row.price_amount) : 0,
    priceCurrency: row.price_currency ?? 'USD',
    priceLabel: row.price_label ?? '',
    rating: row.rating ? Number(row.rating) : 0,
    reviewCount: row.review_count ?? 0,
    imageUrl: row.image_url ?? null,
    imageEmoji: row.image_emoji ?? '🌏',
    affiliateUrl: row.affiliate_url ?? '',
    affiliateProductId: row.affiliate_product_id ?? null,
    affiliatePartner: (row.affiliate_partner ?? 'getyourguide') as Experience['affiliatePartner'],
    sourceEventId: row.source_event_id ?? null,
    isFeatured: row.is_featured ?? false,
    sortOrder: row.sort_order ?? 0,
    highlights: (row.highlights as string[] | null) ?? null,
    includes: (row.includes as string[] | null) ?? null,
    excludes: (row.excludes as string[] | null) ?? null,
    importantInfo: row.important_info ?? null,
    photos: (row.photos as string[] | null) ?? null,
    reviewsSnapshot: (row.reviews_snapshot as Experience['reviewsSnapshot']) ?? null,
    f1Context: row.f1_context ?? null,
    meetingPoint: row.meeting_point ?? null,
    bestseller: row.bestseller ?? null,
    originalPrice: row.original_price ? Number(row.original_price) : null,
    discountPct: row.discount_pct ?? null,
    hasPickUp: row.has_pick_up ?? null,
    mobileVoucher: row.mobile_voucher ?? null,
    instantConfirmation: row.instant_confirmation ?? null,
    skipTheLine: row.skip_the_line ?? null,
    optionsSnapshot: (row.options_snapshot as Experience['optionsSnapshot']) ?? null,
    seoKeywords: (row.seo_keywords as string[] | null) ?? null,
    f1WindowsLabel: row.f1_windows_label ?? null,
    lat: row.lat ? Number(row.lat) : null,
    lng: row.lng ? Number(row.lng) : null,
    languages: (row.languages as string[] | null) ?? null,
    distanceKm: row.distance_km ? Number(row.distance_km) : null,
    neighborhood: row.neighborhood ?? null,
    travelMins: row.travel_mins ?? null,
    guideArticle: row.guide_article ?? null,
    faqItems: (row.faq_items as Experience['faqItems']) ?? null,
  };
}

/** Popularity score for sorting */
function popularityScore(exp: Experience): number {
  return (
    (exp.isFeatured ? 1000 : 0) +
    (exp.bestseller ? 300 : 0) +
    (exp.rating ?? 0) * 20 +
    (exp.reviewCount ?? 0) / 10
  );
}

export async function getExperiencesByRace(
  raceId: number,
  filter?: Pick<ExperienceFilter, 'category' | 'windowSlug' | 'sort' | 'affiliatePartner'>
): Promise<Experience[]> {
  let rows: (typeof experiences.$inferSelect)[];

  if (filter?.windowSlug) {
    // Join through windows_map
    const windowRows = await db
      .select({ id: experience_windows.id })
      .from(experience_windows)
      .where(and(eq(experience_windows.race_id, raceId), eq(experience_windows.slug, filter.windowSlug)));

    if (!windowRows.length) return [];
    const windowId = windowRows[0].id;

    const conditions = [eq(experience_windows_map.window_id, windowId)];
    if (filter?.affiliatePartner) {
      conditions.push(eq(experiences.affiliate_partner, filter.affiliatePartner));
    }

    const mapped = await db
      .select({ experience: experiences })
      .from(experience_windows_map)
      .innerJoin(experiences, eq(experience_windows_map.experience_id, experiences.id))
      .where(and(...conditions));

    rows = mapped.map(m => m.experience);
  } else {
    const conditions = [eq(experiences.race_id, raceId)];
    if (filter?.category) conditions.push(eq(experiences.category, filter.category));
    if (filter?.affiliatePartner) conditions.push(eq(experiences.affiliate_partner, filter.affiliatePartner));
    
    rows = await db.select().from(experiences).where(and(...conditions));
  }

  const mapped = rows.map(mapExperience);

  // Apply category filter post-join if using windowSlug
  const filtered = filter?.category && filter.windowSlug
    ? mapped.filter(e => e.category === filter.category)
    : mapped;

  // Sort
  const sort = filter?.sort ?? 'popular';
  if (sort === 'popular') {
    return filtered.sort((a, b) => {
      // Featured first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      // Then by sortOrder
      return a.sortOrder - b.sortOrder;
    });
  } else if (sort === 'price-low') {
    return filtered.sort((a, b) => a.priceAmount - b.priceAmount);
  } else if (sort === 'price-high') {
    return filtered.sort((a, b) => b.priceAmount - a.priceAmount);
  } else if (sort === 'duration-short') {
    return filtered.sort((a, b) => a.durationHours - b.durationHours);
  } else if (sort === 'rating') {
    return filtered.sort((a, b) => b.rating - a.rating);
  }
  return filtered;
}

export async function getExperienceBySlug(slug: string, raceId?: number): Promise<Experience | null> {
  const conditions = [eq(experiences.slug, slug)];
  if (raceId !== undefined) conditions.push(eq(experiences.race_id, raceId));
  const [row] = await db
    .select()
    .from(experiences)
    .where(and(...conditions))
    .limit(1);
  return row ? mapExperience(row) : null;
}

export async function getFeaturedExperiences(raceId: number, limit = 6): Promise<Experience[]> {
  const rows = await db
    .select()
    .from(experiences)
    .where(and(eq(experiences.race_id, raceId), eq(experiences.is_featured, true)))
    .limit(limit);
  return rows.map(mapExperience).sort((a, b) => popularityScore(b) - popularityScore(a));
}

export async function getSuggestedExperiences(
  raceId: number,
  excludeSlug: string,
  limit = 4
): Promise<Experience[]> {
  const rows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.race_id, raceId))
    .orderBy(desc(experiences.is_featured), desc(experiences.sort_order))
    .limit(limit + 5);
  return rows
    .map(mapExperience)
    .filter(e => e.slug !== excludeSlug)
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, limit);
}

export async function getExperiencesByIds(ids: number[]): Promise<Experience[]> {
  if (!ids.length) return [];
  const rows = await db.select().from(experiences).where(inArray(experiences.id, ids));
  return rows.map(mapExperience);
}
