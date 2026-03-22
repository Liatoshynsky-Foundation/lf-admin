import type { SeoData } from './seo.mapper';
import { mapSeoBase } from './seo.mapper';

export const mapToUpdateMediaMentionInput = (data: Readonly<SeoData>) => ({
  ...mapSeoBase(data),
  url: data.meta.ua.canonicalUrl || null,
  adminTitle: data.meta.ua.title,
  slug: null,
  status: null,
  publishedAt: null
});
