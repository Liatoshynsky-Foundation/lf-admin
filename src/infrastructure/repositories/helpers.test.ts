import { buildBaseQuery, createToEntity, getBaseSort } from './helpers';
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
          const filters = { status: 'published' };
          const result = buildBaseQuery<MockDbModel>(filters);
          expect(result).toEqual({ status: 'published' });
        });

        it('should include slug in query if provided', () => {
          const filters = { slug: 'some-slug' };
          const result = buildBaseQuery<MockDbModel>(filters);
          expect(result).toEqual({ slug: 'some-slug' });
        });

        it('should include both status and slug', () => {
          const filters = { status: 'draft', slug: 'my-post' };
          const result = buildBaseQuery<MockDbModel>(filters);
          expect(result).toEqual({ status: 'draft', slug: 'my-post' });
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