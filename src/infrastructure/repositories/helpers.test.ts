import { buildBaseQuery, combineConditions, createToEntity, fieldCondition, getBaseSort } from './helpers';
import { BaseEntity } from '~/domain/repositories/baseRepository';
import { SortByDate, SortOrder } from '~/types/enums/common.enums';

describe('Repository Helpers', () => {

  describe('createToEntity', () => {
        interface TestEntity extends BaseEntity {
            title: string;
            isActive: boolean;
        }

        interface TestDbDoc {
            _id: { toString(): string };
            createdAt: string;
            updatedAt: string;
            title: string;
            isActive: boolean;
        }

        it('should correctly map DB document to Entity', () => {
          const mockDbDoc: TestDbDoc = {
            _id: { toString: () => '507f1f77bcf86cd799439011' },
            createdAt: '2026-03-12T10:00:00Z',
            updatedAt: '2026-03-12T11:00:00Z',
            title: 'Test Title',
            isActive: true
          };

          const extraFields = {
            title: mockDbDoc.title,
            isActive: mockDbDoc.isActive
          };

          const result = createToEntity<TestEntity, TestDbDoc>(mockDbDoc, extraFields);

          expect(result).toEqual({
            id: '507f1f77bcf86cd799439011',
            createdAt: '2026-03-12T10:00:00Z',
            updatedAt: '2026-03-12T11:00:00Z',
            title: 'Test Title',
            isActive: true
          });
        });
  });

  describe('buildBaseQuery', () => {
        interface MockDbModel {
            status: string;
            slug: string;
        }

        it('should return empty object when no filters provided', () => {
          expect(buildBaseQuery<MockDbModel>()).toEqual({});
        });

        it('should include status in query if provided', () => {
          const filters = { statuses: ['published'] };
          const result = buildBaseQuery<MockDbModel>(filters);
          expect(result).toEqual({ status: { $in: ['published'] } });
        });

        it('should include slug in query if provided', () => {
          const filters = { slug: 'some-slug' };
          const result = buildBaseQuery<MockDbModel>(filters);
          expect(result).toEqual({ slug: 'some-slug' });
        });

        it('should include both status and slug', () => {
          const filters = { statuses: ['draft'], slug: 'my-post' };
          const result = buildBaseQuery<MockDbModel>(filters);
          expect(result).toEqual({
            $and: [
              { status: { $in: ['draft'] } },
              { slug: 'my-post' }
            ]
          });
        });

        it('should combine base filters with search conditions using $and', () => {
          const filters = { statuses: ['draft'], slug: 'my-post', search: 'festival' };
          const result = buildBaseQuery<MockDbModel>(filters);

          expect(result).toEqual({
            $and: [
              { status: { $in: ['draft'] } },
              { slug: 'my-post' },
              {
                $or: [
                  { adminTitle: /festival/i },
                  { 'title.uk': /festival/i },
                  { 'title.en': /festival/i }
                ]
              }
            ]
          });
        });
  });

  describe('getBaseSort', () => {
    it('should return default sort by createdAt desc when no sort filters', () => {
      expect(getBaseSort()).toEqual({ createdAt: -1 });
      expect(getBaseSort({})).toEqual({ createdAt: -1 });
      expect(getBaseSort({ sort: [] })).toEqual({ createdAt: -1 });
    });

    it('should map SortOrder.Asc to 1', () => {
      const filters = {
        sort: [{ sortBy: SortByDate.PublishedAt, sortOrder: SortOrder.Asc }]
      };
      const result = getBaseSort(filters);
      expect(result).toEqual({ publishedAt: 1 });
    });

    it('should map SortOrder.Desc to -1', () => {
      const filters = {
        sort: [{ sortBy: SortByDate.AdminTitle, sortOrder: SortOrder.Desc }]
      };
      const result = getBaseSort(filters);
      expect(result).toEqual({ adminTitle: -1 });
    });

    it('should only use the first sort criteria if multiple are provided', () => {
      const filters = {
        sort: [
          { sortBy: SortByDate.CreatedAt, sortOrder: SortOrder.Desc },
          { sortBy: SortByDate.UpdatedAt, sortOrder: SortOrder.Asc }
        ]
      };
      const result = getBaseSort(filters);
      expect(result).toEqual({ createdAt: -1 });
    });
  });
});

describe('getLanguageCondition and language filtering', () => {
  it('should build query for "uk" language', () => {
    const result = buildBaseQuery({ languages: ['uk'] });
    expect(result).toEqual({
      $or: [{
        $and: [{ 'title.uk': { $nin: ['', null] } }, { 'title.en': { $in: ['', null] } }]
      }]
    });
  });

  it('should build query for "en" language', () => {
    const result = buildBaseQuery({ languages: ['en'] });
    expect(result).toEqual({
      $or: [{
        $and: [{ 'title.en': { $nin: ['', null] } }, { 'title.uk': { $in: ['', null] } }]
      }]
    });
  });

  it('should build query for "bilingual" language', () => {
    const result = buildBaseQuery({ languages: ['bilingual'] });
    expect(result).toEqual({
      $or: [{
        $and: [{ 'title.uk': { $nin: ['', null] } }, { 'title.en': { $nin: ['', null] } }]
      }]
    });
  });

  it('should ignore unknown languages (returning null) and empty language arrays', () => {
    const result = buildBaseQuery({ languages: [] });
    expect(result).toEqual({});
  });

  it('should combine multiple valid languages with $or', () => {
    const result = buildBaseQuery({ languages: ['uk', 'en'] });
    expect(result).toEqual({
      $or: [
        { $and: [{ 'title.uk': { $nin: ['', null] } }, { 'title.en': { $in: ['', null] } }] },
        { $and: [{ 'title.en': { $nin: ['', null] } }, { 'title.uk': { $in: ['', null] } }] }
      ]
    });
  });
});

describe('fieldCondition', () => {
  it('should return null for undefined, null, or empty array values', () => {
    expect(fieldCondition('status', undefined)).toBeNull();
    expect(fieldCondition('status', null)).toBeNull();
    expect(fieldCondition('status', [])).toBeNull();
  });

  it('should return simple field match for single value', () => {
    expect(fieldCondition('status', 'draft')).toEqual({ status: 'draft' });
  });

  it('should return $in operator for array of values', () => {
    expect(fieldCondition('status', ['draft', 'published'])).toEqual({ 
      status: { $in: ['draft', 'published'] } 
    });
  });

  it('should handle fallbackValue correctly', () => {
    const field = 'category';
    const fallback = 'uncategorized';
      
    const result = fieldCondition(field, ['news', fallback], fallback);
    expect(result).toEqual({
      $or: [
        { $or: [{ [field]: fallback }, { [field]: { $exists: false } }, { [field]: null }] },
        { [field]: { $in: ['news'] } }
      ]
    });
  });

  it('should return only fallback query if no other values provided', () => {
    const field = 'category';
    const fallback = 'uncategorized';
      
    const result = fieldCondition(field, [fallback], fallback);
    expect(result).toEqual({
      $or: [{ [field]: fallback }, { [field]: { $exists: false } }, { [field]: null }]
    });
  });
});

describe('combineConditions', () => {
  it('should return empty object if all conditions are null/undefined or empty', () => {
    expect(combineConditions([null, undefined])).toEqual({});
    expect(combineConditions([{}])).toEqual({});
  });

  it('should return the single non-empty condition as is', () => {
    const cond = { status: 'published' };
    expect(combineConditions([null, cond])).toEqual(cond);
  });

  it('should combine multiple conditions with $and', () => {
    const cond1 = { status: 'published' };
    const cond2 = { slug: 'test' };
      
    expect(combineConditions([cond1, cond2])).toEqual({
      $and: [cond1, cond2]
    });
  });

  it('should filter out empty objects before combining', () => {
    const cond1 = { status: 'published' };
    expect(combineConditions([cond1, {}])).toEqual(cond1);
  });
});
