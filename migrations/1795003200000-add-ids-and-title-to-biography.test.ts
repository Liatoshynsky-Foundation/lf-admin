import type { Db } from 'mongodb';

import { addBiographyIds, BIOGRAPHY_HERO_TITLE, down, up } from './1795003200000-add-ids-and-title-to-biography';

let mockIdCounter = 0;

jest.mock('mongodb', () => ({
  ObjectId: jest.fn().mockImplementation(() => ({ toString: () => `generated-${++mockIdCounter}` }))
}));

type BiographyDocument = { blocks?: Record<string, unknown> } | null;

const createDb = (documents: Record<string, BiographyDocument>) => {
  const collections: Record<string, { findOne: jest.Mock; updateOne: jest.Mock }> = {};

  const collection = jest.fn((name: string) => {
    collections[name] ??= {
      findOne: jest.fn().mockResolvedValue(documents[name] ?? null),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
    };
    return collections[name];
  });

  return { db: { collection } as unknown as Db, collections };
};

const biographyContent = [
  {
    yearTitle: '1900-1910',
    items: [
      { type: 'chronologyList', listItems: [{ description: { uk: 'Текст', en: 'Text' } }] },
      { type: 'OnlyImageBlock', mainImage: { src: '/image.jpg' } }
    ]
  },
  { yearTitle: '1910', items: [{ type: 'excerptBlockItem', quote: { text: { uk: 'Цитата', en: 'Quote' } } }] }
];

const heroSection = { quote: { text: { uk: 'Цитата', en: 'Quote' } }, noteText: { uk: 'Примітка', en: 'Note' } };

describe('1795003200000-add-ids-and-title-to-biography', () => {
  beforeEach(() => {
    mockIdCounter = 0;
  });

  describe('addBiographyIds', () => {
    it('adds IDs to every year and section and keeps their content and order', () => {
      const result = addBiographyIds(biographyContent);

      expect(result.map((year) => year.id)).toEqual(['generated-1', 'generated-4']);
      expect(result[0].items?.map((item) => item.id)).toEqual(['generated-2', 'generated-3']);
      expect(result[0].yearTitle).toBe('1900-1910');
      expect(result[0].items?.[0]).toMatchObject(biographyContent[0].items[0]);
      expect(result[1].items?.[0]).toMatchObject(biographyContent[1].items[0]);
    });

    it('keeps existing IDs', () => {
      const result = addBiographyIds([{ id: 'year-1', items: [{ id: 'section-1', type: 'chronologyList' }] }]);

      expect(result).toEqual([{ id: 'year-1', items: [{ id: 'section-1', type: 'chronologyList' }] }]);
    });
  });

  describe('up', () => {
    it('adds IDs and the hero title in published and draft biography pages', async () => {
      const page = { blocks: { heroSection, biographyContent } };
      const { db, collections } = createDb({ pages: page, draftpages: page });

      await up(db);

      ['pages', 'draftpages'].forEach((name) => {
        const [filter, update] = collections[name].updateOne.mock.calls[0];
        expect(filter).toEqual({ slug: 'biography' });
        expect(update.$set['blocks.heroSection.title']).toEqual(BIOGRAPHY_HERO_TITLE);
        expect(update.$set['blocks.biographyContent']).toHaveLength(2);
        expect(update.$set['blocks.biographyContent'][0].id).toEqual(expect.any(String));
      });
    });

    it('does not change a page that already has IDs and a hero title, so it can be rerun safely', async () => {
      const migratedPage = {
        blocks: {
          heroSection: { ...heroSection, title: { uk: 'Змінений заголовок', en: 'Edited title' } },
          biographyContent: addBiographyIds(biographyContent)
        }
      };
      const { db, collections } = createDb({ pages: migratedPage, draftpages: migratedPage });

      await up(db);

      expect(collections.pages.updateOne).not.toHaveBeenCalled();
      expect(collections.draftpages.updateOne).not.toHaveBeenCalled();
    });

    it('adds IDs only to new years and sections without changing existing ones', async () => {
      const page = {
        blocks: {
          heroSection: { ...heroSection, title: BIOGRAPHY_HERO_TITLE },
          biographyContent: [{ id: 'year-1', items: [{ id: 'section-1' }, { type: 'fullWidthImage' }] }]
        }
      };
      const { db, collections } = createDb({ pages: page });

      await up(db);

      const [, update] = collections.pages.updateOne.mock.calls[0];
      expect(update.$set).not.toHaveProperty(['blocks.heroSection.title']);
      expect(update.$set['blocks.biographyContent']).toEqual([
        { id: 'year-1', items: [{ id: 'section-1' }, { type: 'fullWidthImage', id: 'generated-1' }] }
      ]);
    });

    it('skips collections without a biography page', async () => {
      const { db, collections } = createDb({ pages: null, draftpages: null });

      await up(db);

      expect(collections.pages.updateOne).not.toHaveBeenCalled();
      expect(collections.draftpages.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('down', () => {
    it('does not remove IDs or the hero title', async () => {
      const { db } = createDb({});

      await down(db);

      expect((db.collection as jest.Mock)).not.toHaveBeenCalled();
    });
  });
});