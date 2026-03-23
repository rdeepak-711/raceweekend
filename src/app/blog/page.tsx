import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/services/blog.service';
import { SITE_URL } from '@/lib/constants/site';

export const metadata: Metadata = {
  title: 'Race Weekend Blog — F1 & MotoGP Travel Stories',
  description: 'Race previews, experience reviews, and city guides for F1 and MotoGP fans. Written by Deepak.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: { 'application/rss+xml': `${SITE_URL}/blog/feed.xml` },
  },
  openGraph: {
    title: 'Race Weekend Blog — F1 & MotoGP Travel Stories',
    description: 'Race previews, experience reviews, and city guides for F1 and MotoGP fans.',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  'race-preview': 'Race Preview',
  'experience-review': 'Experience Review',
  'city-guide': 'City Guide',
  'f1': 'Formula 1',
  'motogp': 'MotoGP',
  'tips': 'Tips',
  'general': 'General',
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
  ],
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts({ limit: 50 });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="min-h-screen pt-20 pb-24 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-5xl mx-auto">
          <div className="py-16 mb-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-4">
              Race Weekend
            </p>
            <h1 className="font-display font-black text-5xl md:text-7xl text-white uppercase italic tracking-tighter leading-none mb-6">
              Blog
            </h1>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Race previews, city guides, and experience reviews from someone who has actually been there.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-24 bg-[var(--bg-secondary)] rounded-3xl border border-white/5">
              <p className="text-6xl mb-4">✍️</p>
              <h2 className="font-display font-black text-2xl text-white uppercase italic mb-3">Stories Coming Soon</h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                Race guides, city travel stories, and experience reviews are on the way.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden hover:border-white/20 transition-colors"
                >
                  {post.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
                        {CATEGORY_LABELS[post.category] ?? post.category}
                      </span>
                      {post.publishedAt && (
                        <>
                          <span className="text-[var(--text-tertiary)]">·</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display font-black text-lg text-white uppercase italic tracking-tight leading-tight mb-2 group-hover:text-[var(--accent-teal)] transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-tertiary)] mt-3">By {post.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
