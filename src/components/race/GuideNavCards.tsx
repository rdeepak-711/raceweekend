'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface SubPage {
  href: string;
  icon: string;
  label: string;
  desc: string;
}

interface Props {
  subPages: SubPage[];
  raceSlug: string;
  accentColor: string;
  series?: 'f1' | 'motogp';
}

export default function GuideNavCards({ subPages, raceSlug, accentColor, series = 'f1' }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {subPages.map(({ href, icon, label, desc }) => (
        <motion.div key={href} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Link
            href={`/${series}/${raceSlug}/${href}`}
            className="group block p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <span className="text-3xl block mb-3">{icon}</span>
            <p
              className="font-display font-bold text-white text-sm mb-1 transition-colors"
              style={{ ['--group-hover-color' as string]: accentColor }}
            >
              {label}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
