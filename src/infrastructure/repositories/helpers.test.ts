import { buildBaseQuery, createToEntity, getBaseSort } from './helpers';
import { SortByDate, SortOrder } from '~/types/enums/common.enums';

describe('Repository Helpers', () => {
  describe('createToEntity', () => {
    interface TestEntity {
      id: string;
      title: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }

    interface TestDbDoc {
      _id: { toString(): string };
      createdAt: Date;
      updatedAt: Date;
      title: string;
      isActive: boolean;
    }

    it('should correctly map DB document to Entity', () => {
      const mockDbDoc: TestDbDoc = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        createdAt: new Date('2026-03-12T10:00:00Z'),
        updatedAt: new Date('2026-03-12T11:00:00Z'),
        title: 'Test Title',
        isActive: true
      };

      const result = createToEntity<TestEntity, TestDbDoc>(mockDbDoc, {
        title: mockDbDoc.title,
        isActive: mockDbDoc.isActive
      });

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        createdAt: '2026-03-12T10:00:00.000Z',
        updatedAt: '2026-03-12T11:00:00.000Z',
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
      const filters = {
        statuses: ['draft'],
        slug: 'my-post',
        search: 'festival'
      };

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

      expect(getBaseSort(filters)).toEqual({ publishedAt: 1 });
    });

    it('should map SortOrder.Desc to -1', () => {
      const filters = {
        sort: [{ sortBy: SortByDate.AdminTitle, sortOrder: SortOrder.Desc }]
      };

      expect(getBaseSort(filters)).toEqual({ adminTitle: -1 });
    });

    it('should only use the first sort criteria if multiple are provided', () => {
      const filters = {
        sort: [
          { sortBy: SortByDate.CreatedAt, sortOrder: SortOrder.Desc },
          { sortBy: SortByDate.UpdatedAt, sortOrder: SortOrder.Asc }
        ]
      };

      expect(getBaseSort(filters)).toEqual({ createdAt: -1 });
    });
  });
});
