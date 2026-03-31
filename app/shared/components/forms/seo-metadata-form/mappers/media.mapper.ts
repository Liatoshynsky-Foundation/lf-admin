import type { SeoData } from './seo.mapper';
import { mapSeoBase } from './seo.mapper';

export const mapToUpdateMediaMentionInput = (data: Readonly<SeoData>) => ({
  ...mapSeoBase(data)
});
