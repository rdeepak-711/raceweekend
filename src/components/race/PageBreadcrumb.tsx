import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

export default function PageBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)] mb-4 flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="opacity-40">/</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-white hover:underline underline-offset-2 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-white">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
