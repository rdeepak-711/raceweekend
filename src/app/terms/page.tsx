import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Race Weekend',
  description: 'The terms and conditions for using the Race Weekend platform.',
  alternates: { canonical: 'https://raceweekend.app/terms' },
  openGraph: {
    title: 'Terms of Service | Race Weekend',
    description: 'The terms and conditions for using the Race Weekend platform.',
  },
  twitter: {
    card: 'summary',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-16 border-b border-white/5 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-4">Legal</p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white uppercase italic tracking-tighter leading-tight">
            Terms of Service
          </h1>
          <p className="text-[var(--text-tertiary)] mt-4 font-mono text-xs uppercase tracking-widest">Last Updated: March 13, 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-12">
          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">1. Acceptance of Terms</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              By accessing and using raceweekend.app (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">2. Use of the Service</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Race Weekend provides race schedules, ticket listings, and travel information for informational purposes only. While we strive for accuracy, race times and event details are subject to change by the official organizers (FIA, FIM, etc.).
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">3. Bookings and Payments</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Race Weekend does not process payments or handle ticket inventory directly. All bookings are completed on third-party platforms (GetYourGuide, Ticketmaster). Any issues with bookings, refunds, or event access must be handled directly with the provider where the purchase was made.
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">4. Itinerary Builder</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              The Itinerary Builder is a planning tool. Your generated itineraries are stored publicly via a unique URL. Do not include sensitive personal information in your itinerary notes. We are not responsible for any lost or deleted itinerary data.
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">5. Intellectual Property</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              The design, layout, and original content of Race Weekend are protected by copyright. "Formula 1", "F1", "MotoGP", and related marks are trademarks of their respective owners. Race Weekend is an independent fan project and is not affiliated with, endorsed by, or sponsored by the FIA, FIM, or any race team.
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">6. Limitation of Liability</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              In no event shall Race Weekend be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="pt-12 border-t border-white/5">
            <h2 className="font-display font-black text-xl text-white uppercase italic mb-4">Questions?</h2>
            <p className="text-[var(--text-secondary)]">
              If you have any questions about these Terms, please reach out:
            </p>
            <p className="text-[var(--accent-teal)] font-bold mt-2">{process.env.CONTACT_EMAIL ?? 'onlyforthe20thcentury@gmail.com'}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
