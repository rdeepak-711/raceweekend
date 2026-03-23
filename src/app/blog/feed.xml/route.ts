import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/services/blog.service';
import { SITE_URL } from '@/lib/constants/site';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getBlogPosts({ limit: 100 });

  const items = posts
    .map((post) => {
      const pubDate = (post.publishedAt ?? post.createdAt).toUTCString();
      const link = `${SITE_URL}/blog/${post.slug}`;
      const description = escapeXml(post.excerpt ?? post.seoDescription ?? '');
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author)}</author>
      <description>${description}</description>
      ${post.tags?.map((t) => `<category>${escapeXml(t)}</category>`).join('\n      ') ?? ''}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Race Weekend Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Race previews, experience reviews, and city guides for F1 and MotoGP fans.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
