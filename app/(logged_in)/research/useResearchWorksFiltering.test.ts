import { act, renderHook } from '@testing-library/react';

import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('~/constants/sort', () => ({
  SORT_FIELD_OPTIONS: [
    { value: 'date', label: 'Дата' },
    { value: 'name', label: 'Назва' }
  ],
  SORT_ORDER_OPTIONS: [
    { value: 'desc', label: 'Спадання' },
    { value: 'asc', label: 'Зростання' }
  ],
  SORT_OPTIONS: [
    { value: 'date_desc', label: 'Дата (нові)' },
    { value: 'date_asc', label: 'Дата (старі)' },
    { value: 'name_asc', label: 'Назва (А-Я)' },
    { value: 'name_desc', label: 'Назва (Я-А)' }
  ]
}));

const SORT_STORAGE_KEY = 'research_works_sort';

describe('useResearchWorksFiltering', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with default sort, empty filters, empty search and filters panel open', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.sortValue).toBe('date_desc');
      expect(result.current.selectedFilters).toEqual({ status: [] });
      expect(result.current.toolbarProps.isFiltersOpen).toBe(true);
      expect(result.current.toolbarProps.activeFiltersCount).toBe(0);
      expect(result.current.toolbarProps.search!.search).toBe('');
      expect(result.current.toolbarProps.search!.placeholder).toBe('Пошук');
    });

    it('exposes a single status filter config', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.toolbarProps.filters).toHaveLength(1);
      expect(result.current.toolbarProps.filters![0].id).toBe('status');
      expect(result.current.toolbarProps.filters![0].hideClearAction).toBe(true);
    });

    it('sets sortProps triggerLabel to the label of the default sort option', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.sortProps.triggerLabel).toBe('Дата (нові)');
      expect(result.current.sortProps.fieldValue).toBe('date');
      expect(result.current.sortProps.value).toBe('date_desc');
    });
  });

  describe('reading sort value from localStorage on mount', () => {
    it('applies a valid stored sort value', () => {
      window.localStorage.setItem(SORT_STORAGE_KEY, 'name_asc');

      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.sortValue).toBe('name_asc');
      expect(result.current.sortProps.fieldValue).toBe('name');
      expect(result.current.sortProps.triggerLabel).toBe('Назва (А-Я)');
    });

    it('ignores an invalid stored sort value and keeps the default', () => {
      window.localStorage.setItem(SORT_STORAGE_KEY, 'totally_invalid');

      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.sortValue).toBe('date_desc');
    });

    it('keeps the default when nothing is stored', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.sortValue).toBe('date_desc');
    });
  });

  describe('search', () => {
    it('updates search text via setSearch', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.toolbarProps.search!.setSearch('архимович');
      });

      expect(result.current.toolbarProps.search!.search).toBe('архимович');
    });
  });

  describe('filters panel toggle', () => {
    it('toggles isFiltersOpen from true to false and back', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.toolbarProps.onToggleFilters!();
      });
      expect(result.current.toolbarProps.isFiltersOpen).toBe(false);

      act(() => {
        result.current.toolbarProps.onToggleFilters!();
      });
      expect(result.current.toolbarProps.isFiltersOpen).toBe(true);
    });
  });

  describe('filter selection', () => {
    it('sets status filters and keeps only valid status entries', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());
      const statusFilter = result.current.toolbarProps.filters![0];

      act(() => {
        statusFilter.onChange([BaseContentStatuses.Published, BaseContentStatuses.Hidden, 'not-a-status']);
      });

      expect(result.current.selectedFilters.status).toEqual([
        BaseContentStatuses.Published,
        BaseContentStatuses.Hidden
      ]);
      expect(result.current.toolbarProps.activeFiltersCount).toBe(2);
    });

    it('clears all filters via onClearFilters', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());
      const statusFilter = result.current.toolbarProps.filters![0];

      act(() => {
        statusFilter.onChange([BaseContentStatuses.Published]);
      });
      expect(result.current.toolbarProps.activeFiltersCount).toBe(1);

      act(() => {
        result.current.toolbarProps.onClearFilters!();
      });

      expect(result.current.selectedFilters).toEqual({ status: [] });
      expect(result.current.toolbarProps.activeFiltersCount).toBe(0);
    });
  });

  describe('sort field change', () => {
    it('switches from date to name using the name default when current value has no name variant selected', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.sortProps.onFieldChange('name');
      });

      expect(result.current.sortValue).toBe('name_asc');
      expect(window.localStorage.getItem(SORT_STORAGE_KEY)).toBe('name_asc');
    });

    it('switches from name back to date using the date default', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.sortProps.onFieldChange('name');
      });
      act(() => {
        result.current.sortProps.onFieldChange('date');
      });

      expect(result.current.sortValue).toBe('date_desc');
      expect(window.localStorage.getItem(SORT_STORAGE_KEY)).toBe('date_desc');
    });

    it('preserves the current value when switching to a field that already matches the prefix', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.sortProps.onValueChange('date_asc');
      });
      act(() => {
        result.current.sortProps.onFieldChange('date');
      });

      expect(result.current.sortValue).toBe('date_asc');
    });
  });

  describe('sort value change', () => {
    it('sets an explicit sort value and persists it to localStorage', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.sortProps.onValueChange('name_desc');
      });

      expect(result.current.sortValue).toBe('name_desc');
      expect(result.current.sortProps.fieldValue).toBe('name');
      expect(result.current.sortProps.triggerLabel).toBe('Назва (Я-А)');
      expect(window.localStorage.getItem(SORT_STORAGE_KEY)).toBe('name_desc');
    });
  });

  describe('referential stability', () => {
    it('keeps toolbarProps and sortProps stable across unrelated rerenders', () => {
      const { result, rerender } = renderHook(() => useResearchWorksFiltering());

      const firstToolbarProps = result.current.toolbarProps;
      const firstSortProps = result.current.sortProps;

      rerender();

      expect(result.current.toolbarProps).toBe(firstToolbarProps);
      expect(result.current.sortProps).toBe(firstSortProps);
    });

    it('produces a new toolbarProps reference after search changes', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());
      const firstToolbarProps = result.current.toolbarProps;

      act(() => {
        result.current.toolbarProps.search!.setSearch('нове значення');
      });

      expect(result.current.toolbarProps).not.toBe(firstToolbarProps);
    });
  });
});