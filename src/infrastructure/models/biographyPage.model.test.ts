/**
 * @jest-environment node
 */
jest.unmock('mongoose');

import { BiographyPageModel } from './page.model';

const localized = (uk: string, en: string) => ({ uk, en });

const createBiographyPage = (overrides: Record<string, unknown> = {}) => ({
  slug: 'biography',
  blocks: {
    heroSection: {
      title: localized('Життєпис', 'Biography'),
      noteText: localized('Примітка', 'Note')
    },
    biographyContent: [
      {
        id: 'year-1',
        yearTitle: '1900-1910',
        items: [
          {
            id: 'section-1',
            type: 'chronologyList',
            listItems: [{ description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } } }]
          },
          { id: 'section-2', type: 'excerptBlockItem', quote: { text: localized('Цитата', 'Quote'), source: localized('Джерело', 'Source') } }
        ]
      }
    ],
    LiatoshynskyOffice: { quote: { text: localized('Текст', 'Text'), source: localized('Автор', 'Author') } },
    ...overrides
  }
});

const getBlocksValidationPaths = (page: Record<string, unknown>) => {
  const error = new BiographyPageModel(page).validateSync();
  return Object.keys(error?.errors ?? {}).filter((path) => path.startsWith('blocks'));
};

describe('BiographyPageModel', () => {
  it('accepts years with ordered sections of the supported types', () => {
    expect(getBlocksValidationPaths(createBiographyPage())).toEqual([]);
  });

  it('stores the biography page type as the discriminator', () => {
    const page = new BiographyPageModel(createBiographyPage());

    expect(page.get('pageType')).toBe('BiographyPage');
  });

  it('keeps the section-specific fields and does not add Mongo _id to years and sections', () => {
    const page = new BiographyPageModel(createBiographyPage()).toObject();
    const [year] = page.blocks.biographyContent;

    expect(year).not.toHaveProperty('_id');
    expect(year.items[0]).not.toHaveProperty('_id');
    expect(year.items[0].listItems).toHaveLength(1);
    expect(year.items[1].quote.text.uk).toBe('Цитата');
    expect(page.blocks.heroSection.noteText.en).toBe('Note');
  });

  it('allows any year title, including an empty one', () => {
    const paths = getBlocksValidationPaths(
      createBiographyPage({ biographyContent: [{ id: 'year-1', yearTitle: null, items: [] }] })
    );

    expect(paths).toEqual([]);
  });

  it('requires IDs for years and sections', () => {
    const paths = getBlocksValidationPaths(
      createBiographyPage({
        biographyContent: [{ yearTitle: '1910', items: [{ type: 'chronologyList', listItems: [] }] }]
      })
    );

    expect(paths).toEqual(
      expect.arrayContaining(['blocks.biographyContent.0.id', 'blocks.biographyContent.0.items.0.id'])
    );
  });

  it('rejects unsupported section types', () => {
    const paths = getBlocksValidationPaths(
      createBiographyPage({
        biographyContent: [{ id: 'year-1', yearTitle: '1910', items: [{ id: 'section-1', type: 'video' }] }]
      })
    );

    expect(paths).toContain('blocks.biographyContent.0.items.0.type');
  });

  it('requires the hero title in both languages', () => {
    const paths = getBlocksValidationPaths(createBiographyPage({ heroSection: { title: { uk: 'Життєпис' } } }));

    expect(paths).toContain('blocks.heroSection.title.en');
  });
});