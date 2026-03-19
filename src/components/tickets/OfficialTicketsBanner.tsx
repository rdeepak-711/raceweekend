interface Props {
  url: string;
  raceName: string;
  accentColor?: string;
  series?: 'f1' | 'motogp';
}

const SERIES_META = {
  f1: {
    label: 'F1',
    domain: 'tickets.formula1.com',
    source: 'Formula 1 Official',
  },
  motogp: {
    label: 'MotoGP',
    domain: 'motogppremier.motogp.com',
    source: 'MotoGP Premier',
  },
} as const;

export default function OfficialTicketsBanner({ url, raceName, accentColor = '#e10600', series = 'f1' }: Props) {
  const meta = SERIES_META[series];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-2xl border border-white/10 overflow-hidden hover:border-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] group"
      style={{ background: `linear-gradient(135deg, #1a0000 0%, #0d0d0d 50%, #000814 100%)` }}
    >
      <div className="relative px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Accent glow */}
        <div
          className="absolute top-0 left-0 w-72 h-full blur-[80px] opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${accentColor} 0%, transparent 70%)` }}
        />

        {/* Left: branding + race info */}
        <div className="relative z-10 flex items-center gap-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-black text-white text-lg italic shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            {meta.label}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-0.5">
              Official Tickets
            </p>
            <p className="font-display font-black text-xl text-white uppercase italic tracking-tight leading-none">
              {raceName}
            </p>
            <p className="text-[11px] text-white/40 mt-1 font-mono">{meta.domain}</p>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Buy direct from</p>
            <p className="text-xs font-bold text-white/70">{meta.source}</p>
          </div>
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all group-hover:brightness-110"
            style={{ backgroundColor: accentColor }}
          >
            Get Tickets
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-6 py-2.5 border-t border-white/5 flex items-center justify-between bg-black/30">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
          Click to open on {meta.domain}
        </p>
        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Opens in new tab ↗</p>
      </div>
    </a>
  );
}
