import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Get in Touch | Race Weekend',
  description: 'Have a feature request, bug report, or just want to talk racing? Reach out to the Race Weekend team.',
  alternates: { canonical: 'https://raceweekend.co/contact' },
  openGraph: {
    title: 'Get in Touch | Race Weekend',
    description: 'Feature requests, bug reports, or talking F1 & MotoGP — let\'s connect.',
    images: [{ url: 'https://raceweekend.co/og/contact.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://raceweekend.co/og/contact.jpg'],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-20 pb-24 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-2xl mx-auto">

        <div className="py-16">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-6">
            Contact
          </p>

          <h1 className="font-display font-black text-5xl md:text-6xl text-white uppercase italic tracking-tighter leading-none mb-6">
            Let&apos;s Talk.
          </h1>

          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-12">
            Race Weekend is a solo project — there&apos;s a real person on the other end of every message.
            Whether it&apos;s a bug, a feature idea, a partnership, or you just want to talk racing,
            reach out.
          </p>

          <div className="mb-20">
            <ContactForm />
          </div>

          {/* Contact info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {[
              { icon: '🐛', title: 'Bug Reports', body: 'Found something broken? Tell me exactly what happened and I\'ll fix it.' },
              { icon: '💡', title: 'Feature Ideas', body: 'Have a race or feature you\'d love to see? I\'m all ears.' },
              { icon: '🤝', title: 'Partnerships', body: 'Experiences operators, ticket platforms, or travel brands — let\'s talk.' },
              { icon: '🏁', title: 'Just Racing', body: 'Want to chat F1 or MotoGP? Always down for a conversation.' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-display font-bold text-white text-sm mb-1">{item.title}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-[var(--border-subtle)] mb-10" />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Made by</p>
              <p className="font-display font-black text-white italic">Codephilic Studio</p>
            </div>
            <Link
              href="/about"
              className="text-sm text-[var(--accent-teal)] font-bold hover:underline underline-offset-4"
            >
              Read our story →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
