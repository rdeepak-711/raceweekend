import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPostBySlug, getRelatedPosts } from '@/services/blog.service';
import { SITE_URL, BASE_OG } from '@/lib/constants/site';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ slug: string }>; }

function clampTitle(input: string, max = 55): string {
  if (input.length <= max) return input;
  const cut = input.lastIndexOf(' ', max - 1);
  return `${input.slice(0, cut > 0 ? cut : max - 1)}…`;
}

function clampDescription(input: string, min = 130, max = 155): string {
  let value = input.trim();
  if (value.length > max) {
    const cut = value.lastIndexOf(' ', max - 1);
    value = `${value.slice(0, cut > 0 ? cut : max - 1)}…`;
  }
  if (value.length < min) return value;
  return value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const title = clampTitle(post.seoTitle ?? post.title);
  const description = clampDescription(post.seoDescription ?? post.excerpt ?? '');
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: { ...BASE_OG,type: 'article',
      title,
      description,
      publishedTime: post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      tags: post.tags ?? [],
      images: post.featuredImage ? [{ url: post.featuredImage, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  'race-preview': 'Race Preview',
  'experience-review': 'Experience Review',
  'city-guide': 'City Guide',
  'f1': 'Formula 1',
  'motogp': 'MotoGP',
  'tips': 'Tips',
  'general': 'General',
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.category, 3);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? post.seoDescription ?? '',
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Race Weekend' },
    datePublished: post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(post.featuredImage ? { image: post.featuredImage } : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([articleLd, breadcrumbLd]) }} />
      <div className="min-h-screen pt-20 pb-24 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="text-sm font-bold text-[var(--accent-teal)] hover:underline mb-8 flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> All Posts
          </Link>

          {post.featuredImage && (
            <div className="relative h-64 md:h-80 overflow-hidden rounded-2xl mb-10 shadow-2xl">
              <Image src={post.featuredImage} alt={post.title} fill priority unoptimized className="object-cover" />
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)]">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
              {post.publishedAt && (
                <>
                  <span className="text-[var(--text-tertiary)]">·</span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-white uppercase italic tracking-tighter leading-none mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-[var(--text-secondary)] leading-relaxed border-l-4 border-[var(--accent-teal)] pl-5">
                {post.excerpt}
              </p>
            )}
            <p className="text-xs text-[var(--text-tertiary)] mt-4">By {post.author}</p>
          </div>

          <div className="h-px bg-[var(--border-subtle)] mb-10" />

          {post.content && (
            <div
              className="prose prose-invert max-w-none
                prose-headings:font-display prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight
                prose-h2:text-2xl prose-h3:text-xl
                prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
                prose-strong:text-white
                prose-a:text-[var(--accent-teal)] prose-a:no-underline hover:prose-a:underline
                prose-li:text-[var(--text-secondary)]
                mb-16"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-16">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="font-display font-black text-xl text-white uppercase italic mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map(p => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="block p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-white/20 transition-colors"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-teal)] block mb-1">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                    <p className="font-display font-black text-sm text-white uppercase italic leading-tight">{p.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
