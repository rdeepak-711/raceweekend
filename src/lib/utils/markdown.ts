import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function parseMarkdown(content: string): string {
  const raw = marked.parse(content, { async: false, breaks: false, gfm: true });
  const html = typeof raw === 'string' ? raw : '';
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
  });
}
