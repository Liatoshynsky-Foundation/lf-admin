import { act, renderHook } from '@testing-library/react';

import { useFilesFiltering, type UseFilesFilteringItem } from './useFilesFiltering';
import type { FilesTabValue } from '~/constants/files';

const mockItems: UseFilesFilteringItem[] = [
  {
    id: '1',
    name: 'Apple.jpg',
    type: 'image',
    dateAdded: '01.01.2024',
    createdAtRaw: '2024-01-01T10:00:00.000Z',
    format: 'jpeg',
    isStarred: true,
    usage: [{ label: 'Новини компанії' }]
  },
  {
    id: '2',
    name: 'Banana.pdf',
    type: 'pdf',
    dateAdded: '02.01.2024',
    createdAtRaw: '2024-01-02T10:00:00.000Z',
    format: 'pdf',
    isStarred: false,
    usage: [{ label: 'Global Event' }]
  },
  {
    id: '3',
    name: 'Cherry.zip',
    type: 'video',
    dateAdded: '03.01.2024',
    createdAtRaw: '2024-01-03T10:00:00.000Z',
    format: 'x-zip-compressed',
    isStarred: false,
    usage: [{ label: 'Творчий проєкт' }]
  },
  {
    id: '4',
    name: 'Date.docx',
    type: 'audio',
    dateAdded: '04.01.2024',
    createdAtRaw: '2024-01-04T10:00:00.000Z',
    format: 'vnd.openxmlformats-officedocument.wordprocessingml.document',
    isStarred: false,
    usage: [{ label: 'Scientific research' }]
  },
  {
    id: '5',
    name: 'Eggplant.xlsx',
    type: 'image',
    dateAdded: '05.01.2024',
    format: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    isStarred: false,
    usage: [{ label: 'Other page' }]
  }
];

describe('useFilesFiltering', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial State & LocalStorage', () => {
    it('should initialize sort from localStorage if valid', () => {
      localStorage.setItem('files_sort', 'name_desc');
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      expect(result.current.sortProps.value).toBe('name_desc');
    });

    it('should fallback to date_desc if localStorage value is invalid', () => {
      localStorage.setItem('files_sort', 'invalid_sort');
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      expect(result.current.sortProps.value).toBe('date_desc');
    });
  });

  describe('Format Normalization', () => {
    it('should correctly normalize various mime-types', () => {
      const complexItems: UseFilesFilteringItem[] = [
        { id: '1', name: 'a', type: 'image', dateAdded: '1', format: 'svg+xml', usage: [] },
        { id: '2', name: 'b', type: 'image', dateAdded: '2', format: 'msword', usage: [] },
        { id: '3', name: 'c', type: 'image', dateAdded: '3', format: 'vnd.ms-excel', usage: [] }
      ];
      const { result } = renderHook(() => useFilesFiltering(complexItems));

      act(() => {
        result.current.toolbarProps.filters?.[0]?.onChange?.(['svg']);
      });
      expect(result.current.filteredFiles).toHaveLength(1);

      act(() => {
        result.current.toolbarProps.filters?.[0]?.onChange?.(['doc']);
      });
      expect(result.current.filteredFiles).toHaveLength(1);

      act(() => {
        result.current.toolbarProps.filters?.[0]?.onChange?.(['xls']);
      });
      expect(result.current.filteredFiles).toHaveLength(1);
    });

    it('should handle items with missing format and createdAtRaw', () => {
      const incompleteItems: UseFilesFilteringItem[] = [
        {
          id: 'empty',
          name: 'Incomplete',
          type: 'image',
          dateAdded: '06.01.2024',
          usage: []
        }
      ];

      const { result, rerender } = renderHook(
        ({ tab }: { tab: FilesTabValue }) => useFilesFiltering(incompleteItems, tab),
        { initialProps: { tab: 'all' as FilesTabValue } }
      );

      act(() => {
        result.current.toolbarProps.filters?.[0]?.onChange?.(['jpg']);
      });
      expect(result.current.filteredFiles).toHaveLength(0);

      act(() => {
        result.current.toolbarProps.onClearFilters?.();
      });
      expect(result.current.filteredFiles[0]?.id).toBe('empty');

      rerender({ tab: 'docs' as FilesTabValue });
      expect(result.current.filteredFiles).toHaveLength(0);

      act(() => {
        result.current.sortProps.onValueChange('date_asc');
      });
      expect(result.current.sortProps.value).toBe('date_asc');
    });
  });

  describe('Usage Filtering', () => {
    it.each([
      ['news_media', '1'],
      ['events', '2'],
      ['creativity', '3'],
      ['research', '4'],
      ['main_pages', '5']
    ])('should filter by usage category: %s', (usageCategory, expectedId) => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      act(() => {
        result.current.toolbarProps.filters?.[1]?.onChange?.([usageCategory]);
      });
      expect(result.current.filteredFiles[0]?.id).toBe(expectedId);
    });

    it('should categorize as "files" if label matches files regex', () => {
      const fileItem: UseFilesFilteringItem = {
        ...mockItems[0],
        usage: [{ label: 'Архівні файли' }]
      };
      const { result } = renderHook(() => useFilesFiltering([fileItem]));
      act(() => {
        result.current.toolbarProps.filters?.[1]?.onChange?.(['files']);
      });
      expect(result.current.filteredFiles).toHaveLength(1);
    });

    it('should return "unused" for items without usage links', () => {
      const unusedItem: UseFilesFilteringItem = { ...mockItems[0], usage: [] };
      const { result } = renderHook(() => useFilesFiltering([unusedItem]));
      act(() => {
        result.current.toolbarProps.filters?.[1]?.onChange?.(['unused']);
      });
      expect(result.current.filteredFiles).toHaveLength(1);
    });
  });

  describe('Sorting Logic', () => {
    it('should sort by name_asc and name_desc', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));

      act(() => {
        result.current.sortProps.onValueChange('name_asc');
      });
      expect(result.current.filteredFiles[0]?.name).toBe('Apple.jpg');

      act(() => {
        result.current.sortProps.onValueChange('name_desc');
      });
      expect(result.current.filteredFiles[0]?.name).toBe('Eggplant.xlsx');
    });

    it('should sort by date_asc and date_desc', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));

      act(() => {
        result.current.sortProps.onValueChange('date_asc');
      });
      expect(result.current.filteredFiles[0]?.id).toBe('1');

      act(() => {
        result.current.sortProps.onValueChange('date_desc');
      });
      expect(result.current.filteredFiles[0]?.id).toBe('5');
    });

    it('should handle onFieldChange correctly for "date"', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      act(() => {
        result.current.sortProps.onFieldChange('date');
      });
      expect(result.current.sortProps.value).toBe('date_desc');
      expect(localStorage.getItem('files_sort')).toBe('date_desc');
    });

    it('should handle onFieldChange correctly for "name"', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      act(() => {
        result.current.sortProps.onFieldChange('name');
      });
      expect(result.current.sortProps.value).toBe('name_asc');
      expect(localStorage.getItem('files_sort')).toBe('name_asc');
    });
  });

  describe('Tabs Filtering', () => {
    it('should filter by favorites tab', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems, 'favorites'));
      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0]?.id).toBe('1');
    });

    it('should filter by docs tab', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems, 'docs'));
      expect(result.current.filteredFiles).toHaveLength(4);
    });

    it('should filter by specific type tab', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems, 'audio'));
      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0]?.id).toBe('4');
    });
  });

  describe('Toolbar Actions', () => {
    it('should toggle filters open state', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      expect(result.current.toolbarProps.isFiltersOpen).toBe(false);
      act(() => {
        result.current.toolbarProps.onToggleFilters?.();
      });
      expect(result.current.toolbarProps.isFiltersOpen).toBe(true);
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      act(() => {
        result.current.toolbarProps.filters?.[0]?.onChange?.(['jpg']);
        result.current.toolbarProps.filters?.[1]?.onChange?.(['news_media']);
      });
      expect(result.current.toolbarProps.activeFiltersCount).toBe(2);

      act(() => {
        result.current.toolbarProps.onClearFilters?.();
      });
      expect(result.current.toolbarProps.activeFiltersCount).toBe(0);
    });

    it('should update search and filter items', () => {
      const { result } = renderHook(() => useFilesFiltering(mockItems));
      act(() => {
        result.current.toolbarProps.search?.setSearch?.('Banana');
      });
      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0]?.name).toBe('Banana.pdf');
    });
  });
});
