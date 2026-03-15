'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Experience } from '@/types/experience';
import ExperienceCard from './ExperienceCard';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_EMOJIS } from '@/lib/constants/categories';

type SortOption = 'popular' | 'price-low' | 'price-high' | 'duration-short' | 'rating';
type SecondaryFilter = 'luxury' | 'under50' | 'instant' | null;

const CATEGORY_ORDER = ['food', 'culture', 'adventure', 'daytrip', 'nightlife'] as const;

const SESSION_KEY = 'raceweekend-session';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function ExperiencesClient({
  initialExperiences = [],
  raceSlug,
  series,
}: {
  initialExperiences?: Experience[];
  raceSlug: string;
  series: 'f1' | 'motogp';
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) ?? 'popular');
  const [secondaryFilter, setSecondaryFilter] = useState<SecondaryFilter>(null);
  
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const exp of initialExperiences) {
      counts[exp.category] = (counts[exp.category] ?? 0) + 1;
    }
    return counts;
  }, [initialExperiences]);

  const buildUrl = useCallback(
    (newCat: string, newSort: SortOption) => {
      const params = new URLSearchParams();
      if (newCat) params.set('category', newCat);
      if (newSort !== 'popular') params.set('sort', newSort);
      const base = `/${series}/${raceSlug}/experiences`;
      return `${base}${params.size ? `?${params.toString()}` : ''}`;
    },
    [raceSlug, series]
  );

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    router.replace(buildUrl(cat, sort), { scroll: false });
  };

  const handleSortChange = (s: SortOption) => {
    setSort(s);
    router.replace(buildUrl(category, s), { scroll: false });
  };

  useEffect(() => {
    const hasFilters = category || sort !== 'popular';
    if (isFirstRender.current && !hasFilters) {
      isFirstRender.current = false;
      return;
    }
    isFirstRender.current = false;

    setLoading(true);
    const params = new URLSearchParams({ race: raceSlug });
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);

    fetch(`/api/experiences?${params.toString()}`)
      .then(r => r.json())
      .then(data => { setExperiences(data.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, sort, raceSlug]);

  const processedExperiences = useMemo(() => {
    let result = [...experiences];

    // Apply secondary filters in-memory
    if (secondaryFilter === 'luxury') {
      result = result.filter(e => (e.priceAmount ?? 0) > 100);
    } else if (secondaryFilter === 'under50') {
      result = result.filter(e => (e.priceAmount ?? 0) < 50);
    } else if (secondaryFilter === 'instant') {
      result = result.filter(e => e.instantConfirmation);
    }

    // Pin bestseller to top
    const bestsellers = result.filter(e => e.bestseller);
    const others = result.filter(e => !e.bestseller);
    
    return [...bestsellers, ...others];
  }, [experiences, secondaryFilter]);

  const handleBook = async (experienceId: number) => {
    setBookingId(experienceId);
    try {
      const res = await fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienceId, source: 'feed', sessionId: getSessionId() }),
      });
      const { affiliateUrl } = await res.json();
      window.open(affiliateUrl, '_blank');
    } catch {
      const exp = experiences.find(e => e.id === experienceId);
      if (exp?.affiliateUrl) window.open(exp.affiliateUrl, '_blank');
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="pb-20">
      {/* Filter bar */}
      <div className="sticky top-[6.25rem] z-20 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] -mx-4 px-4 py-4 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                category === ''
                  ? 'bg-white text-[var(--bg-primary)] border-white'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              All
            </button>

            {CATEGORY_ORDER.map(cat => {
              const isActive = category === cat;
              const color = CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={isActive ? { borderColor: color, color, backgroundColor: `${color}18` } : {}}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                    isActive ? '' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-3">
               <span className="hidden md:inline text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest">Sort by</span>
               <select
                 value={sort}
                 onChange={e => handleSortChange(e.target.value as SortOption)}
                 className="text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--accent-teal)] transition-colors cursor-pointer"
               >
                 <option value="popular">Most Popular</option>
                 <option value="price-low">Price: Low to High</option>
                 <option value="price-high">Price: High to Low</option>
                 <option value="rating">Highest Rated</option>
                 <option value="duration-short">Shortest First</option>
               </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
             <div className="flex items-center gap-2">
                {[
                  { id: 'luxury', label: '💎 Luxury', color: 'purple' },
                  { id: 'under50', label: '🏷️ Under $50', color: 'green' },
                  { id: 'instant', label: '⚡ Instant Book', color: 'teal' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSecondaryFilter(secondaryFilter === f.id ? null : f.id as SecondaryFilter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      secondaryFilter === f.id
                        ? 'bg-white text-[var(--bg-primary)] border-white shadow-lg'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
             
             <p className="text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest">
               {processedExperiences.length} experiences found
             </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl shimmer border border-white/5" />
          ))}
        </div>
      ) : processedExperiences.length === 0 ? (
        <div className="text-center py-32 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-subtle)]">
          <p className="text-6xl mb-6">🏁</p>
          <p className="text-xl font-black text-white uppercase italic">No experiences found</p>
          <p className="text-[var(--text-secondary)] mt-2">Try clearing your filters to see more results.</p>
          <button 
            onClick={() => { setCategory(''); setSecondaryFilter(null); }}
            className="mt-6 text-[var(--accent-teal)] font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedExperiences.map((exp, i) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onBook={handleBook}
              loading={bookingId === exp.id}
              index={i}
              isFirst={i === 0}
              detailHref={`/${series}/${raceSlug}/experiences/${exp.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
