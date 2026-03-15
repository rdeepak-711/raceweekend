'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Itinerary } from '@/types/itinerary';
import type { Race, Session } from '@/types/race';
import type { Experience } from '@/types/experience';
import { CATEGORY_COLORS } from '@/lib/constants/categories';
import { SERIES_META } from '@/lib/constants/series';

interface Props {
  itinerary: Itinerary;
  race: Race;
  sessions: Session[];
  experiences: Experience[];
}

export default function ItineraryView({ itinerary, race, sessions, experiences }: Props) {
  const meta = SERIES_META[race.series];
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceweekend.app'}/itinerary/${itinerary.id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto print:max-w-none print:mx-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <span className="text-5xl">{race.flagEmoji}</span>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">Strategy_Briefing</span>
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: meta.color }}>{meta.emoji} {race.series.toUpperCase()} · Round {race.round}</p>
          </div>
          <h1 className="font-display font-black text-4xl text-white uppercase italic leading-none">{race.city} Grand Prix</h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-2 uppercase tracking-widest">{race.name} · {race.raceDate}</p>
        </div>
      </div>

      {/* Primary Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12 print:hidden">
        <a
          href={`/api/itinerary/${itinerary.id}/calendar`}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
        >
          <span>🗓</span> Add to Calendar
        </a>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/10 text-white font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all"
        >
          <span>🖨</span> Print Briefing
        </button>
      </div>

      {/* Share link */}
      <div className="p-6 rounded-3xl border border-[var(--accent-teal)]/30 bg-[var(--accent-teal)]/5 mb-12 relative overflow-hidden group print:hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <span className="text-6xl font-display font-black italic">SHARE</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-3">TACTICAL_LINK_ENCRYPTED</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="flex-1 text-sm text-white font-mono break-all bg-black/40 p-3 rounded-xl border border-white/5">{shareUrl}</p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl);
                alert('Link copied to clipboard');
              }}
              className="shrink-0 w-12 h-12 rounded-xl bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 flex items-center justify-center text-xl hover:bg-[var(--accent-teal)] hover:text-black transition-all"
              title="Copy Link"
            >
              📋
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just deployed my tactical strategy for the ${race.city} GP on @raceweekend. Rate my setup:`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              <span>𝕏</span> Share on X
            </a>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Here is the plan for the ${race.city} race weekend: ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 transition-all"
            >
              <span>💬</span> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Sessions - Deployment Schedule */}
      {sessions.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg border border-white/5">🏁</div>
            <h2 className="font-display font-black text-xl text-white uppercase italic tracking-tight">Deployment Schedule</h2>
          </div>
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] shadow-[0_0_8px_var(--accent-teal)]" />
                  <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight">{s.name}</p>
                    <p className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{s.dayOfWeek}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[var(--accent-teal)] font-bold">{s.startTime}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experiences - Intelligence Assets */}
      {experiences.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg border border-white/5">📍</div>
            <h2 className="font-display font-black text-xl text-white uppercase italic tracking-tight">Intelligence Assets</h2>
          </div>
          <div className="space-y-4">
            {experiences.map(exp => {
              const color = CATEGORY_COLORS[exp.category] ?? '#6E6E82';
              return (
                <div key={exp.id} className="flex flex-col sm:flex-row gap-6 p-5 rounded-3xl border border-white/5 bg-[var(--bg-secondary)] hover:border-white/10 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                    <span className="text-6xl font-display font-black italic">INTEL</span>
                  </div>
                  
                  <div className="relative w-full sm:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                    {exp.imageUrl ? (
                      <Image src={exp.imageUrl} alt={exp.title} fill sizes="128px" referrerPolicy="no-referrer" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: `${color}10` }}>
                        {exp.imageEmoji}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded text-[8px] font-black text-[var(--accent-teal)] bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 uppercase tracking-widest">
                        {exp.category}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{exp.durationLabel}</span>
                    </div>
                    <p className="font-bold text-white uppercase tracking-tight text-lg mb-1">{exp.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-4">{exp.shortDescription}</p>
                    
                    <a
                      href={`/go/experience/${exp.id}?src=itinerary`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="print:hidden inline-flex items-center gap-2 text-[10px] font-black px-5 py-2.5 rounded-xl bg-white text-black uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-lg"
                    >
                      Initialize Booking →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tactical Memo */}
      {itinerary.notes && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg border border-white/5">📝</div>
            <h2 className="font-display font-black text-xl text-white uppercase italic tracking-tight">Tactical Memo</h2>
          </div>
          <div className="p-6 rounded-3xl bg-black border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-teal)]/20" />
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap font-mono uppercase tracking-tight">{itinerary.notes}</p>
          </div>
        </section>
      )}

      <div className="pt-10 border-t border-white/5 text-center print:hidden">
        <Link href="/itinerary" className="text-xs font-black text-[var(--accent-teal)] hover:text-white uppercase tracking-[0.2em] transition-colors">
          [INITIALIZE_NEW_STRATEGY] →
        </Link>
      </div>
    </div>
  );
}
