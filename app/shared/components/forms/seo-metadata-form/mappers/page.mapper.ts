import type { SeoBlockValue } from '../seo-metadata-block/SeoMetadataBlock';
import type { LocalizedMeta } from '../SeoMetadataForm';
import type { GetPageSeoQuery, UpdatePageSeoInput } from '~/types/graphql/generated/graphql';

type PageSeoData = NonNullable<GetPageSeoQuery['pageBlocks']>;

const buildLocaleMeta = (page: PageSeoData, lang: 'uk' | 'en'): LocalizedMeta => ({
  title: page.title[lang] ?? '',
  description: page.description[lang] ?? '',
  keywords: page.keywords?.[lang] ?? '',
});

export const mapPageToSeoBlockValue = (page: PageSeoData): SeoBlockValue => ({
  meta: {
    uk: buildLocaleMeta(page, 'uk'),
    en: buildLocaleMeta(page, 'en')
  },
  ogImage: page.coverImage?.src ?? null,
  allowIndexing: {
    uk: page.allowIndexation?.uk ?? true,
    en: page.allowIndexation?.en ?? true
  }
});

export const mapSeoBlockValueToUpdatePageSeoInput = (slug: string, value: SeoBlockValue): UpdatePageSeoInput => ({
  slug,
  title: {
    uk: value.meta.uk.title,
    en: value.meta.en.title
  },
  description: {
    uk: value.meta.uk.description,
    en: value.meta.en.description
  },
  keywords: {
    uk: value.meta.uk.keywords,
    en: value.meta.en.keywords
  },
  allowIndexation: {
    uk: value.allowIndexing.uk,
    en: value.allowIndexing.en
  }
});
