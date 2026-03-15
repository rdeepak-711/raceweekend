'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Experience } from '@/types/experience';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants/categories';
import { formatPrice } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';
import RaceImage from '@/components/layout/RaceImage';

interface Props {
  experience: Experience;
  onBook?: (id: number) => void;
  loading?: boolean;
  index?: number;
  detailHref: string;
  isFirst?: boolean;
}

export default function ExperienceCard({ 
  experience, 
  onBook, 
  loading, 
  index = 0, 
  detailHref,
  isFirst = false
}: Props) {
  const { convertPrice } = useCurrency();
  const color = CATEGORY_COLORS[experience.category] ?? '#6E6E82';
  const categoryLabel = CATEGORY_LABELS[experience.category] ?? experience.category;

  const bookedCount = Math.min(Math.floor(experience.reviewCount / 30), 500);
  const showMostPopular = isFirst || (experience.isFeatured && experience.bestseller);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden hover:border-[var(--accent-teal)]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
    >
      <Link href={detailHref} className="block relative h-64 overflow-hidden">
        <RaceImage
          src={experience.imageUrl || ''}
          alt={experience.title || 'Experience'}
          fill
          referrerPolicy="no-referrer"
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          fallbackEmoji={experience.imageEmoji || '🏁'}
          accentColor={color}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-black/20 opacity-60" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/10" style={{ color, backgroundColor: 'rgba(15,15,23,0.8)' }}>
            {categoryLabel}
          </span>
          {experience.affiliatePartner === 'ticketmaster' && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[var(--accent-f1)] text-white uppercase tracking-widest shadow-xl flex items-center gap-1">
              🎟️ Event
            </span>
          )}
          {showMostPopular && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-500 text-[var(--bg-primary)] uppercase tracking-widest shadow-xl flex items-center gap-1">
              🔥 Most Popular
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {experience.instantConfirmation && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[var(--accent-teal)] text-[var(--bg-primary)] uppercase tracking-widest shadow-xl flex items-center gap-1">
              ⚡ Instant
            </span>
          )}
          {experience.discountPct && (
            <span className="text-sm font-black px-3 py-1.5 rounded-xl bg-green-500 text-white shadow-xl flex items-center gap-1 scale-110 origin-right">
              -{experience.discountPct}%
            </span>
          )}
        </div>

        {/* Bottom Social Proof */}
        {bookedCount > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
             <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full inline-flex items-center gap-2">
               <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-5 h-5 rounded-full border border-[var(--bg-primary)] bg-gradient-to-br from-orange-400 to-rose-500" />
                 ))}
               </div>
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">Booked {bookedCount}+ times</span>
             </div>
          </div>
        )}
      </Link>

      <div className="p-6">
        <Link href={detailHref}>
          <h3 className="font-display font-bold text-white text-xl leading-snug mb-3 hover:text-[var(--accent-teal)] transition-colors line-clamp-2 min-h-[3.5rem]">
            {experience.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">
          <span className="flex items-center gap-1.5"><span className="text-lg">⏱</span> {experience.durationLabel}</span>
          <span className="flex items-center gap-1.5"><span className="text-lg text-amber-500">★</span> {experience.rating.toFixed(1)} <span className="opacity-50">({experience.reviewCount})</span></span>
        </div>

        <div className="flex items-end justify-between gap-4 mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-black text-white">
                {experience.priceAmount ? convertPrice(Number(experience.priceAmount), experience.priceCurrency || 'USD').label : experience.priceLabel}
              </span>
              {experience.originalPrice && (
                <span className="text-sm text-[var(--text-tertiary)] line-through font-bold">
                  {convertPrice(Number(experience.originalPrice), experience.priceCurrency || 'USD').label}
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">per person</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                window.open(`/go/experience/${experience.id}?src=feed`, '_blank');
              }}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-black bg-[var(--accent-f1)] hover:bg-[var(--accent-f1-hover)] text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent-f1)]/20 uppercase tracking-wider"
            >
              {loading ? '...' : 'Book'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
