import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-xs">
            <Link
              href="/"
              className="font-display font-black text-xl tracking-tighter text-white uppercase italic mb-4 block"
            >
              RACE<span className="text-[var(--accent-teal)]">WEEK</span>END
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              The ultimate 2026 race travel companion. Plan your F1 and MotoGP weekends with curated local experiences and live schedules.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/5">
                Independent Product
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Series</h4>
              <ul className="space-y-4">
                <li><Link href="/f1" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Formula 1</Link></li>
                <li><Link href="/motogp" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">MotoGP</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Tools</h4>
              <ul className="space-y-4">
                <li><Link href="/itinerary" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Itinerary Builder</Link></li>
                <li><Link href="/tickets" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Ticket Finder</Link></li>
                <li><Link href="/blog" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="/site-directory" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Sitemap</Link></li>
                <li><Link href="/privacy" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 RaceWeekend. We earn commissions from GetYourGuide and Ticketmaster affiliate links.</p>
          <div className="flex items-center gap-6">
            <span>Built for fans</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
