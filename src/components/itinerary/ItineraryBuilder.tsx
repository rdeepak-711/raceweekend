'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Race } from '@/types/race';
import type { Session } from '@/types/race';
import type { Experience } from '@/types/experience';
import ExperienceCard from '@/components/experiences/ExperienceCard';
import TicketCard from '@/components/tickets/TicketCard';
import SeriesBadge from '@/components/race/SeriesBadge';
import SkeletonTactical from '@/components/layout/SkeletonTactical';
import { SERIES_META } from '@/lib/constants/series';
import type { Ticket } from '@/types/ticket';

// Tickets from the JSON API have id as number (not bigint)
type TicketJSON = Omit<Ticket, 'id'> & { id: number };

type Step = 1 | 2 | 3 | 4;

interface Props {
  races: Race[];
  f1Races: Race[];
  motoGPRaces: Race[];
  allSessions: Record<number, Session[]>;
  allExperiences: Record<number, Experience[]>;
}

const STORAGE_KEY = 'rw-itinerary-draft';

// Helper to convert HH:MM:SS to minutes from midnight
const timeToMinutes = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + (parts[1] || 0);
};

export default function ItineraryBuilder({ races, f1Races, motoGPRaces, allSessions, allExperiences }: Props) {
  const router = useRouter();
  
  // Initialize state
  const [step, setStep] = useState<Step>(1);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketJSON[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.selectedRaceId) setSelectedRaceId(data.selectedRaceId);
        if (data.selectedSessions) setSelectedSessions(data.selectedSessions);
        if (data.selectedExperiences) setSelectedExperiences(data.selectedExperiences);
        if (data.notes) setNotes(data.notes);
        if (data.groupSize) setGroupSize(data.groupSize);
        if (data.step && data.step <= 4) setStep(data.step);
      } catch (e) {
        console.error('Failed to parse saved itinerary', e);
      }
    }
    setIsDataLoaded(true);
  }, []);

  // Save state on changes
  useEffect(() => {
    if (!isDataLoaded) return;
    const state = {
      step,
      selectedRaceId,
      selectedSessions,
      selectedExperiences,
      notes,
      groupSize
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [step, selectedRaceId, selectedSessions, selectedExperiences, notes, groupSize, isDataLoaded]);

  const selectedRace = races.find(r => r.id === selectedRaceId) ?? null;
  const sessions = selectedRaceId ? (allSessions[selectedRaceId] ?? []) : [];
  const experiences = selectedRaceId ? (allExperiences[selectedRaceId] ?? []) : [];

  // Calculate gaps between selected sessions per day
  const gapsByDay = useMemo(() => {
    if (!selectedSessions.length) return {};
    const selected = sessions.filter(s => selectedSessions.includes(s.id));
    const byDay: Record<string, typeof selected> = {};
    selected.forEach(s => {
      if (!s.dayOfWeek) return;
      if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = [];
      byDay[s.dayOfWeek].push(s);
    });

    const gaps: Record<string, Array<{ start: string; end: string; duration: number }>> = {};
    
    Object.entries(byDay).forEach(([day, daySessions]) => {
      const sorted = [...daySessions].sort((a, b) => 
        timeToMinutes(a.startTime || '00:00') - timeToMinutes(b.startTime || '00:00')
      );
      
      const dayGaps = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        const currentEnd = timeToMinutes(sorted[i].endTime || '00:00');
        const nextStart = timeToMinutes(sorted[i+1].startTime || '00:00');
        const diff = nextStart - currentEnd;
        if (diff > 60) { // Only count gaps > 1 hour
          dayGaps.push({
            start: sorted[i].endTime!,
            end: sorted[i+1].startTime!,
            duration: diff / 60
          });
        }
      }
      if (dayGaps.length) gaps[day] = dayGaps;
    });
    return gaps;
  }, [selectedSessions, sessions]);

  // Check if an experience fits in any gap
  const getRecommendation = (exp: Experience) => {
    if (!Object.keys(gapsByDay).length) return null;
    const expDur = parseFloat(exp.durationLabel || '2');
    for (const [day, gaps] of Object.entries(gapsByDay)) {
      const matchingGap = gaps.find(g => g.duration >= expDur);
      if (matchingGap) return { day, gap: matchingGap };
    }
    return null;
  };

  const toggleSession = (id: number) => {
    setSelectedSessions(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleExperience = (id: number) => {
    setSelectedExperiences(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!selectedRaceId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceId: selectedRaceId,
          sessionsSelected: selectedSessions,
          experiencesSelected: selectedExperiences,
          notes,
          groupSize,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setSavedId(data.id);
        localStorage.removeItem(STORAGE_KEY); 
        router.push(`/itinerary/${data.id}`);
      }
    } catch {
      alert('Failed to save itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isDataLoaded) {
    return <SkeletonTactical message="INITIALIZING_ITINERARY_ENGINE..." />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-12">
        {([1, 2, 3, 4] as Step[]).map(s => (
          <div key={s} className="flex flex-1 items-center gap-2 last:flex-none">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${step === s ? 'bg-[var(--accent-teal)] border-[var(--accent-teal)] text-[var(--bg-primary)] shadow-[0_0_20px_rgba(45,212,191,0.3)]'
                : step > s ? 'bg-[var(--accent-teal)]/10 border-[var(--accent-teal)]/40 text-[var(--accent-teal)]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-tertiary)]'
                }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 4 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-[var(--accent-teal)]/40' : 'bg-[var(--border-subtle)]'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Pick race */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-black text-2xl text-white uppercase italic tracking-tight">Step 1: Choose Your Round</h2>
            {(selectedRaceId || selectedSessions.length > 0) && (
              <button 
                onClick={() => { if(confirm('Reset all selections?')) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } }}
                className="text-[10px] font-black text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Reset Draft ↺
              </button>
            )}
          </div>
          <p className="text-[var(--text-secondary)] mb-8 text-sm uppercase tracking-wider">Select a session from the 2026 calendar to initialize strategy.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* F1 column */}
            <div>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/5">
                <span className="text-xl">{SERIES_META.f1.emoji}</span>
                <h3 className="font-display font-black text-xs uppercase tracking-[0.3em]" style={{ color: SERIES_META.f1.color }}>
                  Formula 1
                </h3>
              </div>
              <div className="space-y-3">
                {f1Races.map(race => {
                  const isSelected = selectedRaceId === race.id;
                  const dateLabel = new Date(race.raceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={race.id}
                      onClick={() => { setSelectedRaceId(race.id); setStep(2); }}
                      className="w-full text-left px-5 py-4 rounded-xl border transition-all group relative overflow-hidden"
                      style={{
                        borderColor: isSelected ? SERIES_META.f1.color : 'var(--border-subtle)',
                        backgroundColor: isSelected ? `${SERIES_META.f1.color}15` : 'var(--bg-secondary)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{race.flagEmoji ?? '🏁'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-white text-sm uppercase group-hover:text-[var(--accent-teal)] transition-colors">{race.city}</p>
                          <p className="text-[10px] font-mono text-[var(--text-tertiary)] truncate uppercase">{race.circuitName}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-black" style={{ color: SERIES_META.f1.color }}>RD {race.round}</p>
                          <p className="text-[10px] font-mono text-[var(--text-tertiary)]">{dateLabel}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MotoGP column */}
            <div>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/5">
                <span className="text-xl">{SERIES_META.motogp.emoji}</span>
                <h3 className="font-display font-black text-xs uppercase tracking-[0.3em]" style={{ color: SERIES_META.motogp.color }}>
                  MotoGP
                </h3>
              </div>
              <div className="space-y-3">
                {motoGPRaces.map(race => {
                  const isSelected = selectedRaceId === race.id;
                  const dateLabel = new Date(race.raceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={race.id}
                      onClick={() => { setSelectedRaceId(race.id); setStep(2); }}
                      className="w-full text-left px-5 py-4 rounded-xl border transition-all group relative overflow-hidden"
                      style={{
                        borderColor: isSelected ? SERIES_META.motogp.color : 'var(--border-subtle)',
                        backgroundColor: isSelected ? `${SERIES_META.motogp.color}15` : 'var(--bg-secondary)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{race.flagEmoji ?? '🏁'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-white text-sm uppercase group-hover:text-[var(--accent-teal)] transition-colors">{race.city}</p>
                          <p className="text-[10px] font-mono text-[var(--text-tertiary)] truncate uppercase">{race.circuitName}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-black" style={{ color: SERIES_META.motogp.color }}>RD {race.round}</p>
                          <p className="text-[10px] font-mono text-[var(--text-tertiary)]">{dateLabel}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Select sessions */}
      {step === 2 && selectedRace && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display font-black text-2xl text-white uppercase italic tracking-tight mb-2">Step 2: Sync Sessions</h2>
          <p className="text-[var(--text-secondary)] mb-8 text-sm uppercase tracking-wider">
            Which sessions will you be attending at the {selectedRace.name}?
          </p>
          <div className="space-y-3 mb-10">
            {sessions.map(s => {
              const isSelected = selectedSessions.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSession(s.id)}
                  className={`w-full text-left flex items-center justify-between p-5 rounded-2xl border transition-all ${isSelected
                    ? 'border-[var(--accent-teal)] bg-[var(--accent-teal)]/10 shadow-[0_0_15px_rgba(45,212,191,0.1)]'
                    : 'border-white/5 bg-[var(--bg-secondary)] hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-[var(--accent-teal)]' : 'bg-white/10'}`} />
                    <div>
                      <p className="font-bold text-white uppercase text-sm tracking-tight">{s.name}</p>
                      <p className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">{s.dayOfWeek} · {s.startTime} – {s.endTime}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[var(--accent-teal)] bg-[var(--accent-teal)]' : 'border-white/10'}`}>
                    {isSelected && <span className="text-[var(--bg-primary)] text-xs font-black italic">✔</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="px-8 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
              ← Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 px-8 py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
              Optimize Itinerary →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Select experiences */}
      <AnimatePresence mode="wait">
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display font-black text-2xl text-white uppercase italic tracking-tight mb-2">Step 3: Intelligence Layer</h2>
                <p className="text-[var(--text-secondary)] text-sm uppercase tracking-wider">
                  Fill the gaps between sessions with hand-picked local experiences.
                </p>
              </div>
              {selectedExperiences.length > 0 && (
                <div className="bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--accent-teal)]/20 mb-1">
                  {selectedExperiences.length} Selected
                </div>
              )}
            </div>

            {/* Gap Analysis Legend */}
            {Object.keys(gapsByDay).length > 0 && (
              <div className="mb-8 p-4 rounded-xl bg-[var(--accent-teal)]/5 border border-[var(--accent-teal)]/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">⚡</span>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Smart Recommendations Active</p>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider leading-relaxed">
                  We identified gaps on {Object.keys(gapsByDay).join(', ')}. Look for the <span className="text-[var(--accent-teal)] font-bold">BEST FIT</span> badge for experiences that fit perfectly between your track sessions.
                </p>
              </div>
            )}

            {experiences.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-4xl mb-4 opacity-30">🔍</p>
                <p className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">No intelligence data available for this round yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {experiences.map((exp, i) => {
                  const isSelected = selectedExperiences.includes(exp.id);
                  const rec = getRecommendation(exp);
                  
                  return (
                    <div key={exp.id} className="relative group">
                      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none z-10 ${isSelected ? 'border-2 border-[var(--accent-teal)] ring-4 ring-[var(--accent-teal)]/10' : 'border border-transparent'}`} />
                      
                      {rec && !isSelected && (
                        <div className="absolute -top-3 left-4 z-20 bg-black border border-[var(--accent-teal)] px-3 py-1 rounded-full shadow-xl">
                          <p className="text-[9px] font-black text-[var(--accent-teal)] uppercase tracking-widest">
                            ⚡ Best Fit: {rec.day}
                          </p>
                        </div>
                      )}

                      <div className={`transition-all duration-300 ${isSelected ? 'scale-[0.98]' : 'hover:scale-[1.02]'}`}>
                        <ExperienceCard
                          experience={exp}
                          onBook={() => toggleExperience(exp.id)}
                          loading={false}
                          index={i}
                          detailHref={`/${selectedRace?.series}/${selectedRace?.slug}/experiences/${exp.slug}`}
                        />
                      </div>
                      
                      <button
                        onClick={() => toggleExperience(exp.id)}
                        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-2xl ${isSelected ? 'border-[var(--accent-teal)] bg-[var(--accent-teal)] text-black' : 'border-white/20 bg-black/60 text-white hover:border-[var(--accent-teal)]'}`}
                      >
                        {isSelected ? <span className="font-black text-sm">✔</span> : <span className="font-black text-lg">+</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="px-8 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
                ← Back
              </button>
              <button
                onClick={async () => {
                  setStep(4);
                  if (selectedRaceId) {
                    try {
                      const res = await fetch(`/api/tickets?raceId=${selectedRaceId}`);
                      const json = await res.json();
                      setTickets(json.data ?? []);
                    } catch {}
                  }
                }}
                className="flex-1 px-8 py-3 rounded-xl bg-[var(--accent-teal)] text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(45,212,191,0.25)]"
              >
                Review Full Strategy →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4: Summary + save */}
      {step === 4 && selectedRace && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-black text-3xl text-white uppercase italic tracking-tight">Strategy Briefing</h2>
              <p className="text-[var(--text-secondary)] text-sm uppercase tracking-wider">Finalized Mission Plan for {selectedRace.city}.</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-1 border-t-2 border-r-2 border-[var(--accent-teal)] inline-block mb-2" />
              <p className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-[0.3em]">REF_ID: {Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-8 mb-12">
            {/* 1. Header Card */}
            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: SERIES_META[selectedRace.series].color }} />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <SeriesBadge series={selectedRace.series} size="sm" />
                    <span className="text-[10px] font-black text-[var(--accent-teal)] uppercase tracking-[0.4em]">ROUND_{selectedRace.round}</span>
                  </div>
                  <h3 className="font-display font-black text-4xl md:text-5xl text-white uppercase italic tracking-tighter leading-none">{selectedRace.city} GP</h3>
                  <p className="text-sm font-mono text-[var(--text-tertiary)] mt-4 uppercase tracking-widest">{selectedRace.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold">{selectedRace.circuitName}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-6xl md:text-7xl">{selectedRace.flagEmoji}</span>
                  <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5 text-center min-w-[140px]">
                    <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Race Date</p>
                    <p className="text-white font-display font-bold uppercase italic">{new Date(selectedRace.raceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Tactical Timeline (Sessions) */}
            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-white/5 relative shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/5">📅</div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Deployment Schedule</h4>
              </div>
              
              {selectedSessions.length === 0 ? (
                <div className="py-10 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                  <p className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest italic">No track sessions tracked in strategy.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.filter(s => selectedSessions.includes(s.id)).map((s, idx) => (
                    <div key={s.id} className="group relative flex items-start gap-6 p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-[var(--accent-teal)]/30 transition-all">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)] shadow-[0_0_10px_var(--accent-teal)]" />
                        {idx !== selectedSessions.length - 1 && <div className="w-px h-full bg-white/10 mt-2" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{s.name}</p>
                          <span className="text-[10px] font-mono text-[var(--accent-teal)] font-bold">{s.startTime}</span>
                        </div>
                        <p className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest mt-1">{s.dayOfWeek} · {selectedRace.city} Track</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Intelligence Intel (Experiences) */}
            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-white/5 relative shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <span className="text-8xl font-display font-black italic">INTEL</span>
              </div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/5">📍</div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Intelligence Assets</h4>
              </div>

              {selectedExperiences.length === 0 ? (
                <div className="py-10 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                  <p className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest italic">No intelligence assets acquired.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {experiences.filter(e => selectedExperiences.includes(e.id)).map(e => (
                    <div key={e.id} className="group flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-all overflow-hidden">
                      {e.imageUrl ? (
                        <div className="relative w-full md:w-40 h-32 md:h-24 shrink-0 rounded-xl overflow-hidden border border-white/10">
                          <img src={e.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={e.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      ) : (
                        <div className="w-full md:w-40 h-32 md:h-24 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-4xl border border-white/5">{e.imageEmoji}</div>
                      )}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black text-[var(--accent-teal)] bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 uppercase tracking-widest w-fit mx-auto md:mx-0">
                            {e.category}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{e.durationLabel} Asset</span>
                        </div>
                        <h5 className="text-base font-bold text-white uppercase tracking-tight line-clamp-1">{e.title}</h5>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">{e.shortDescription}</p>
                      </div>
                      <div className="shrink-0 md:border-l md:border-white/5 md:pl-6 text-center md:text-right">
                        <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Est. Cost</p>
                        <p className="text-xl font-display font-black text-white italic">{e.priceLabel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Logistics & Deployment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-white/20 shadow-xl">
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.4em] block mb-6">SQUAD_SYNC_SIZE</label>
                <div className="flex items-center justify-center gap-8">
                  <button onClick={() => setGroupSize(Math.max(1, groupSize - 1))} className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-xl text-white hover:border-[var(--accent-teal)] transition-all">–</button>
                  <div className="text-center">
                    <span className="text-5xl font-display font-black text-white italic tabular-nums">{groupSize}</span>
                    <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Personnel</p>
                  </div>
                  <button onClick={() => setGroupSize(Math.min(20, groupSize + 1))} className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-xl text-white hover:border-[var(--accent-teal)] transition-all">+</button>
                </div>
              </div>
              
              <div className="p-8 rounded-3xl bg-black border border-white/20 shadow-xl relative overflow-hidden group-focus-within:border-[var(--accent-teal)]/50 hover:border-white/30 transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-teal)]/20" />
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <span className="text-6xl font-display font-black italic">MEMO</span>
                </div>
                <label className="text-[10px] font-black text-[var(--accent-teal)] uppercase tracking-[0.4em] block mb-4">TACTICAL_NOTES</label>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 focus-within:bg-white/[0.05] transition-colors">
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="ADD STRATEGIC INTELLIGENCE (HOTELS, FLIGHTS, MEET-UPS)..."
                    className="w-full bg-transparent border-none p-0 text-sm text-white placeholder:text-white/20 focus:ring-0 resize-none font-mono uppercase leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 5. Quick Tickets Access */}
            {tickets.length > 0 && (
              <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <span className="text-9xl italic font-display font-black tracking-tighter">ACCESS</span>
                </div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-teal)]/10 flex items-center justify-center text-xl border border-[var(--accent-teal)]/20 text-[var(--accent-teal)]">🎟</div>
                    <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Verified Access</h4>
                  </div>
                  <Link href={`/${selectedRace.series}/${selectedRace.slug}/tickets`} className="text-[10px] font-black text-[var(--accent-teal)] hover:text-white uppercase tracking-[0.3em] transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    ALL_LISTINGS →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {tickets.slice(0, 2).map(t => (
                    <TicketCard key={t.id} ticket={{ ...t, id: BigInt(t.id) }} raceAccent={SERIES_META[selectedRace.series].color} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setStep(3)} 
              className="px-10 py-5 rounded-2xl border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white/5 transition-all shadow-xl"
            >
              [BACK_TO_COMMS]
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !selectedRaceId}
              className="flex-1 px-10 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-4"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  UPLOADING_PLAN...
                </>
              ) : (
                'FINALIZE & DEPLOY STRATEGY 🔗'
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
