import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { BlogPost } from '@/types/blog';

function mapPost(row: typeof blogPosts.$inferSelect): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? null,
    content: row.content ?? null,
    category: row.category,
    author: row.author ?? 'Deepak',
    tags: (row.tags as string[] | null) ?? [],
    relatedRaceIds: (row.related_race_ids as number[] | null) ?? [],
    featuredImage: row.featured_image ?? null,
    seoTitle: row.seo_title ?? null,
    seoDescription: row.seo_description ?? null,
    isPublished: row.is_published ?? false,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at ?? new Date(),
    updatedAt: row.updated_at ?? new Date(),
  };
}

export async function getBlogPosts(opts: {
  category?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<BlogPost[]> {
  const { category, limit = 12, offset = 0 } = opts;
  const conditions = category
    ? and(eq(blogPosts.is_published, true), eq(blogPosts.category, category))
    : eq(blogPosts.is_published, true);
  const rows = await db
    .select()
    .from(blogPosts)
    .where(conditions)
    .orderBy(desc(blogPosts.published_at))
    .limit(limit)
    .offset(offset);
  return rows.map(mapPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.is_published, true)))
    .limit(1);
  return row ? mapPost(row) : null;
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.is_published, true),
        sql`JSON_CONTAINS(${blogPosts.tags}, ${JSON.stringify(tag)})`,
      )
    )
    .orderBy(desc(blogPosts.published_at));
  return rows.map(mapPost);
}

export async function getRelatedPosts(postId: number, category: string, limit = 3): Promise<BlogPost[]> {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.is_published, true),
        eq(blogPosts.category, category),
        sql`${blogPosts.id} != ${postId}`,
      )
    )
    .orderBy(desc(blogPosts.published_at))
    .limit(limit);
  return rows.map(mapPost);
}

export async function getAllPublishedBlogPosts(): Promise<Pick<BlogPost, 'slug' | 'publishedAt' | 'updatedAt'>[]> {
  const rows = await db
    .select({
      slug: blogPosts.slug,
      publishedAt: blogPosts.published_at,
      updatedAt: blogPosts.updated_at,
    })
    .from(blogPosts)
    .where(eq(blogPosts.is_published, true))
    .orderBy(desc(blogPosts.published_at));
  return rows.map(r => ({
    slug: r.slug,
    publishedAt: r.publishedAt ?? null,
    updatedAt: r.updatedAt ?? new Date(),
  }));
}
