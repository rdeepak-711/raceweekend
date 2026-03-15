import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Race Weekend',
  description: 'How we handle your data and privacy at Race Weekend.',
  alternates: { canonical: 'https://raceweekend.app/privacy' },
  openGraph: {
    title: 'Privacy Policy | Race Weekend',
    description: 'How we handle your data and privacy at Race Weekend.',
  },
  twitter: {
    card: 'summary',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-16 border-b border-white/5 pb-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-4">Legal</p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white uppercase italic tracking-tighter leading-tight">
            Privacy Policy
          </h1>
          <p className="text-[var(--text-tertiary)] mt-4 font-mono text-xs uppercase tracking-widest">Last Updated: March 13, 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-12">
          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">1. Overview</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Race Weekend ("we", "our", or "us") operates the website raceweekend.app. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">2. Affiliate Disclosure</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Race Weekend is a participant in the GetYourGuide and Ticketmaster (via Impact.com) affiliate programs. We provide links to these platforms to help you book race-related experiences and tickets. When you click these links and make a purchase, we may earn a small commission at no extra cost to you.
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">3. Data Collection</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We collect minimal data to provide a better experience:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
              <li><strong>Usage Data:</strong> We use Google Analytics to track how users interact with our site (pages visited, time spent, device type).</li>
              <li><strong>Itinerary Data:</strong> If you use our Itinerary Builder, your selections are stored in our database to generate a unique shareable link.</li>
              <li><strong>Contact Information:</strong> If you contact us via our form, we store your name, email, and message to respond to your inquiry.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">4. Cookies</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Cookies are small files stored on your device. We use them for site analytics and to remember your preferences (such as your selected race series). You can disable cookies in your browser settings, though some features of the site may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">5. Third-Party Links</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Our Service contains links to other sites that are not operated by us. If you click on a third-party link (like Ticketmaster), you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>
          </section>

          <section className="pt-12 border-t border-white/5">
            <h2 className="font-display font-black text-xl text-white uppercase italic mb-4">Contact Us</h2>
            <p className="text-[var(--text-secondary)]">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-[var(--accent-teal)] font-bold mt-2">{process.env.CONTACT_EMAIL ?? 'onlyforthe20thcentury@gmail.com'}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
