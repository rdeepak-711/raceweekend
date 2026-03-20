import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getRacesBySeries, getActiveRaceBySeries } from '@/services/race.service';
import LiveStatusBar from '@/components/race/LiveStatusBar';
import HomepageHero from '@/components/layout/HomepageHero';
import UpcomingRacesStrip from '@/components/layout/UpcomingRacesStrip';
import TabbedCalendar from '@/components/layout/TabbedCalendar';
import dynamic from 'next/dynamic';
import ScrollProgressBar from '@/components/layout/ScrollProgressBar';
import FeatureRevealStrip from '@/components/layout/FeatureRevealStrip';
import LoadingScreen from '@/components/layout/LoadingScreen';
import TelemetryVisualizer from '@/components/layout/TelemetryVisualizer';

export const metadata: Metadata = {
  title: 'Race Weekend | F1 & MotoGP 2026 Travel Guide',
  description: 'Plan your F1 & MotoGP 2026 race weekend. Live telemetry, curated local experiences, session schedules, tickets, and shareable itineraries for all 46 races.',
  alternates: { canonical: 'https://raceweekend.co' },
  openGraph: {
    title: 'Race Weekend | F1 & MotoGP 2026 Travel Guide',
    description: 'The ultimate F1 & MotoGP 2026 travel companion. Live telemetry, curated experiences, and shareable itineraries.',
    url: 'https://raceweekend.co',
    images: [{ url: 'https://raceweekend.co/og-hero.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://raceweekend.co/og-hero.jpg'],
  },
};

export default async function HomePage() {
  await headers();
  // Fetch F1 and MotoGP races in parallel
  const [f1Races, motogpRaces, nextF1, nextMotogp] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
    getActiveRaceBySeries('f1'),
    getActiveRaceBySeries('motogp'),
  ]);

  // Combine and sort for the upcoming races strip (next 2)
  const allUpcoming = [...(nextF1 ? [nextF1] : []), ...(nextMotogp ? [nextMotogp] : [])]
    .sort((a, b) => new Date(a.raceDate).getTime() - new Date(b.raceDate).getTime());

  return (
    <div className="relative min-h-screen bg-[#06060A]">
      <LoadingScreen />
      <ScrollProgressBar />

      {/* Live status bar — sits at top, below nav (pt-14) */}
      <div className="pt-14">
        <LiveStatusBar />
      </div>

      <HomepageHero />

      <UpcomingRacesStrip races={allUpcoming} />

      <TabbedCalendar f1Races={f1Races} motogpRaces={motogpRaces} />

      <FeatureRevealStrip />

      {/* About Section - APEX Upgrade */}
      <section className="max-w-7xl mx-auto px-6 py-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-teal)]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-[var(--accent-teal)]" />
              <span className="text-[var(--accent-teal)] font-mono text-[10px] uppercase tracking-[0.4em]">SYSTEM_MANIFESTO_V1</span>
            </div>
            <h2 className="font-display font-black text-5xl md:text-8xl text-white mb-10 tracking-tighter leading-none italic uppercase">
              NEVER MISS A <br />
              <span className="text-gradient bg-gradient-to-r from-[var(--accent-f1)] to-[var(--accent-motogp)] bg-clip-text text-transparent">TURN</span> AGAIN.
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-12 leading-relaxed font-medium font-mono text-xs uppercase tracking-widest max-w-lg">
              RACEWEEKEND IS THE ULTIMATE DIGITAL PIT WALL FOR THE MODERN FAN. WE CONSOLIDATE LIVE TELEMETRY, LOCAL INTELLIGENCE, AND LOGISTICS INTO ONE HIGH-PERFORMANCE INTERFACE.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { title: 'LIVE_TELEMETRY', desc: 'REAL-TIME SESSION STATUS WITH MILLISECOND PRECISION.', icon: '⚡' },
                { title: 'CITY_INTELLIGENCE', desc: 'VETTED LOCAL EXPERIENCES FOR ALL 24 GLOBAL ROUNDS.', icon: '📍' },
                { title: 'GROUP_SYNC', desc: 'DYNAMIC ITINERARY SHARING FOR YOUR RACE CREW.', icon: '📋' },
                { title: 'MARKET_DATA', desc: 'LIVE TICKETMASTER PRICE TRACKING AND ACCESS.', icon: '🎟' },
              ].map((item, i) => (
                <div key={i} className="group p-6 bg-white/5 border border-white/5 rounded-sm hover:border-[var(--accent-teal)]/30 transition-all">
                  <div className="text-2xl mb-4 grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
                  <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-2">{item.title}</h4>
                  <p className="text-[var(--text-tertiary)] text-[9px] leading-relaxed font-mono uppercase font-bold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Visual Telemetry Simulation */}
            <div className="relative bg-[#0D0D15] border border-white/10 p-12 rounded-sm shadow-2xl">
               {/* Grid Pattern */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
               
               <div className="relative z-10 flex flex-col gap-6">
                 {[
                   { label: 'S1_SECTOR', val: '28.432', color: 'var(--accent-teal)' },
                   { label: 'S2_SECTOR', val: '31.109', color: 'var(--accent-f1)' },
                   { label: 'S3_SECTOR', val: '24.881', color: 'var(--accent-motogp)' },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-end justify-between border-b border-white/5 pb-2">
                     <span className="text-[10px] font-mono text-[var(--text-tertiary)] tracking-widest">{stat.label}</span>
                     <span className="text-3xl font-display font-black text-white italic" style={{ color: stat.color }}>{stat.val}</span>
                   </div>
                 ))}

                 <TelemetryVisualizer />
                 <p className="text-[8px] font-mono text-center text-[var(--text-tertiary)] uppercase tracking-[0.5em]">DATA_STREAM_VISUALIZER_ACTIVE</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary CTA - High Performance */}
      <section className="max-w-7xl mx-auto px-6 mb-48 text-center">
        <div className="p-20 bg-apex-mesh border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-[var(--accent-teal)]/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="font-display font-black text-6xl md:text-8xl text-white mb-8 tracking-tighter uppercase italic leading-[0.85]">
              INITIALIZE <br />
              <span className="text-[var(--accent-teal)]">YOUR TRIP</span>
            </h2>
            <p className="text-[10px] font-mono text-[var(--text-secondary)] mb-12 max-w-xl mx-auto uppercase tracking-[0.4em] leading-loose">
              DEPLOY YOUR CUSTOM WEEKEND STRATEGY. SYNC SESSIONS, CURATE LOCAL INTELLIGENCE, AND BROADCAST TO YOUR CREW.
            </p>
            <Link
              href="/itinerary"
              className="inline-block px-12 py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-xs transition-all hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              LAUNCH_BUILDER [S3] →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
