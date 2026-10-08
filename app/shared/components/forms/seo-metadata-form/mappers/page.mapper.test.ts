import type { SeoBlockValue } from '../seo-metadata-block/SeoMetadataBlock';
import { mapPageToSeoBlockValue, mapSeoBlockValueToUpdatePageSeoInput } from './page.mapper';
import type { GetPageSeoQuery } from '~/types/graphql/generated/graphql';

type PageSeoData = NonNullable<GetPageSeoQuery['pageBlocks']>;

const createPageSeoData = (overrides: Partial<PageSeoData> = {}): PageSeoData => ({
  __typename: 'Page',
  slug: 'about-us',
  title: { __typename: 'LocalizedString', uk: 'Про нас', en: 'About us' },
  description: { __typename: 'LocalizedString', uk: 'Опис', en: 'Description' },
  keywords: { __typename: 'LocalizedString', uk: 'ключові слова', en: 'keywords' },
  coverImage: {
    __typename: 'PageCoverImage',
    src: '/cover.png',
    alt: { __typename: 'LocalizedString', uk: 'Зображення', en: 'Image' }
  },
  allowIndexation: { __typename: 'LocalizedBoolean', uk: false, en: true },
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides
});

describe('page.mapper', () => {
  describe('mapPageToSeoBlockValue', () => {
    it('should map page SEO data to SeoBlockValue', () => {
      const page = createPageSeoData();

      expect(mapPageToSeoBlockValue(page)).toEqual({
        meta: {
          uk: {
            title: 'Про нас',
            description: 'Опис',
            keywords: 'ключові слова',
          },
          en: {
            title: 'About us',
            description: 'Description',
            keywords: 'keywords',
          }
        },
        ogImage: '/cover.png',
        allowIndexing: { uk: false, en: true }
      });
    });

    it('should use defaults for missing optional fields', () => {
      const page = createPageSeoData({
        keywords: null,
        coverImage: undefined,
        allowIndexation: undefined
      });

      expect(mapPageToSeoBlockValue(page)).toEqual({
        meta: {
          uk: { title: 'Про нас', description: 'Опис', keywords: '' },
          en: { title: 'About us', description: 'Description', keywords: '' }
        },
        ogImage: null,
        allowIndexing: { uk: true, en: true }
      });
    });
  });

  describe('mapSeoBlockValueToUpdatePageSeoInput', () => {
    it('should map SeoBlockValue to UpdatePageSeoInput', () => {
      const value: SeoBlockValue = {
        meta: {
          uk: {
            title: 'UK Title',
            description: 'UK Desc',
            keywords: 'uk keywords',
          },
          en: {
            title: 'EN Title',
            description: 'EN Desc',
            keywords: 'en keywords',
          }
        },
        ogImage: '/og.png',
        allowIndexing: { uk: false, en: true }
      };

      expect(mapSeoBlockValueToUpdatePageSeoInput('about-us', value)).toEqual({
        slug: 'about-us',
        title: { uk: 'UK Title', en: 'EN Title' },
        description: { uk: 'UK Desc', en: 'EN Desc' },
        keywords: { uk: 'uk keywords', en: 'en keywords' },
        allowIndexation: { uk: false, en: true }
      });
    });
  });
});
