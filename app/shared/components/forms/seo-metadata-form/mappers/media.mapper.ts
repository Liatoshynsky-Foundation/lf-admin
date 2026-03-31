import type { SeoData } from './seo.mapper';
import { mapSeoBase } from './seo.mapper';

export const mapToUpdateMediaMentionInput = (data: Readonly<SeoData>) => ({
  ...mapSeoBase(data),
  url: data.meta.uk.canonicalUrl || null,
  adminTitle: data.meta.uk.title,
  slug: null,
  status: null,
  publishedAt: null
});
