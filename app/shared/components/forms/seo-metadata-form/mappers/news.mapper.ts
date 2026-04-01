import type { SeoData } from './seo.mapper';
import { mapSeoBase } from './seo.mapper';

export const mapToUpdateNewsInput = (data: Readonly<SeoData>) => ({
  ...mapSeoBase(data)
});
