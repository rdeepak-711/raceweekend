import Link from 'next/link';
import Image from 'next/image';
import type { Experience } from '@/types/experience';
import { CATEGORY_COLORS } from '@/lib/constants/categories';

interface Props {
  experiences: Experience[];
  basePath: string; // e.g. "/f1/australia-f1-2026/experiences"
}

export default function ExperienceSuggestions({ experiences, basePath }: Props) {
  if (!experiences.length) return null;

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-24">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">You might also like</p>
        <div className="space-y-3">
          {experiences.map(exp => {
            const color = CATEGORY_COLORS[exp.category] ?? '#6E6E82';
            const href = `${basePath}/${exp.slug}`;
            return (
              <Link
                key={exp.id}
                href={href}
                className="flex gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-medium)] hover:-translate-y-0.5 transition-all group"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  {exp.imageUrl ? (
                    <Image src={exp.imageUrl} alt={exp.title} fill sizes="64px" referrerPolicy="no-referrer" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: `${color}20` }}>
                      {exp.imageEmoji}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2 leading-snug">
                    {exp.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{exp.priceLabel} · {exp.durationLabel}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
