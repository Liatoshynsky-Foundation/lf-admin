import { act, renderHook } from '@testing-library/react';

import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { RESEARCH_STATUS_OPTIONS, SORT_STORAGE_KEY } from '~/constants/research';
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

describe('useResearchWorksFiltering', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with default sort, empty status filter and empty search', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.sortValue).toBe('date_desc');
      expect(result.current.selectedFilters).toEqual({ status: [] });
      expect(result.current.activeFiltersCount).toBe(0);
      expect(result.current.toolbarProps.search!.search).toBe('');
      expect(result.current.toolbarProps.search!.placeholder).toBe('Пошук');
    });

    it('exposes status filter props', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      expect(result.current.statusFilterProps.label).toBe('Статус');
      expect(result.current.statusFilterProps.value).toEqual([]);
      expect(result.current.statusFilterProps.hideClearAction).toBe(true);
      expect(result.current.statusFilterProps.options).toEqual(RESEARCH_STATUS_OPTIONS);
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

  describe('status filter selection', () => {
    it('sets status filters and keeps only valid status entries', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.statusFilterProps.onChange([
          BaseContentStatuses.Published,
          BaseContentStatuses.Hidden,
          'not-a-status'
        ]);
      });

      expect(result.current.selectedFilters.status).toEqual([
        BaseContentStatuses.Published,
        BaseContentStatuses.Hidden
      ]);
      expect(result.current.activeFiltersCount).toBe(2);
    });

    it('updates statusFilterProps.value to reflect the selected filters', () => {
      const { result } = renderHook(() => useResearchWorksFiltering());

      act(() => {
        result.current.statusFilterProps.onChange([BaseContentStatuses.Published]);
      });

      expect(result.current.statusFilterProps.value).toEqual([BaseContentStatuses.Published]);
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
});
