import { act, renderHook } from '@testing-library/react';

import { useWorksFiltering } from './useWorksFiltering';
import { FilesSortValue } from '~/constants/sort';

jest.mock('~/constants/creativity', () => ({
  WORKS_STATUSES: ['draft', 'published', 'archived'],
  WORKS_FILTERS: [
    {
      id: 'status',
      label: 'Статус',
      options: [
        { value: 'draft', label: 'Чернетка' },
        { value: 'published', label: 'Опубліковано' },
        { value: 'archived', label: 'Архів' }
      ],
      menuMinWidth: 160
    },
    {
      id: 'language',
      label: 'Мова',
      options: [
        { value: 'uk', label: 'Українська' },
        { value: 'en', label: 'Англійська' },
        { value: 'bilingual', label: 'Двомовний' }
      ],
      menuMinWidth: 160
    }
  ]
}));

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

const SORT_STORAGE_KEY = 'works_sort';

describe('useWorksFiltering', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with default sort, empty filters, empty search and filters panel closed', () => {
      const { result } = renderHook(() => useWorksFiltering());

      expect(result.current.sortValue).toBe('date_desc');
      expect(result.current.selectedFilters).toEqual({ status: [], language: [] });
      expect(result.current.toolbarProps.isFiltersOpen).toBe(false);
      expect(result.current.toolbarProps.activeFiltersCount).toBe(0);
      expect(result.current.toolbarProps.search!.search).toBe('');
      expect(result.current.toolbarProps.search!.placeholder).toBe('Пошук');
    });

    it('exposes two filter configs derived from WORKS_FILTERS', () => {
      const { result } = renderHook(() => useWorksFiltering());

      expect(result.current.toolbarProps.filters).toHaveLength(2);
      expect(result.current.toolbarProps.filters!.map((f) => f.id)).toEqual(['status', 'language']);
      result.current.toolbarProps.filters!.forEach((filter) => {
        expect(filter.hideClearAction).toBe(true);
      });
    });

    it('sets sortProps triggerLabel to the label of the default sort option', () => {
      const { result } = renderHook(() => useWorksFiltering());

      expect(result.current.sortProps.triggerLabel).toBe('Дата (нові)');
      expect(result.current.sortProps.fieldValue).toBe('date');
      expect(result.current.sortProps.value).toBe('date_desc');
    });
  });

  describe('reading sort value from localStorage on mount', () => {
    it('applies a valid stored sort value', () => {
      window.localStorage.setItem(SORT_STORAGE_KEY, 'name_asc');

      const { result } = renderHook(() => useWorksFiltering());

      expect(result.current.sortValue).toBe('name_asc');
      expect(result.current.sortProps.fieldValue).toBe('name');
      expect(result.current.sortProps.triggerLabel).toBe('Назва (А-Я)');
    });

    it('ignores an invalid stored sort value and keeps the default', () => {
      window.localStorage.setItem(SORT_STORAGE_KEY, 'totally_invalid');

      const { result } = renderHook(() => useWorksFiltering());

      expect(result.current.sortValue).toBe('date_desc');
    });

    it('keeps the default when nothing is stored', () => {
      const { result } = renderHook(() => useWorksFiltering());

      expect(result.current.sortValue).toBe('date_desc');
    });
  });

  describe('search', () => {
    it('updates search text via setSearch', () => {
      const { result } = renderHook(() => useWorksFiltering());

      act(() => {
        result.current.toolbarProps.search!.setSearch('лорд буревісник');
      });

      expect(result.current.toolbarProps.search!.search).toBe('лорд буревісник');
    });
  });

  describe('filters panel toggle', () => {
    it('toggles isFiltersOpen from false to true and back', () => {
      const { result } = renderHook(() => useWorksFiltering());

      act(() => {
      result.current.toolbarProps.onToggleFilters!();
      });
      expect(result.current.toolbarProps.isFiltersOpen).toBe(true);

      act(() => {
      result.current.toolbarProps.onToggleFilters!();
      });
      expect(result.current.toolbarProps.isFiltersOpen).toBe(false);
    });
  });

  describe('filter selection', () => {
    it('sets status filters and keeps only valid WorksStatusValue entries', () => {
      const { result } = renderHook(() => useWorksFiltering());
      const statusFilter = result.current.toolbarProps.filters!.find((f) => f.id === 'status')!;

      act(() => {
        statusFilter.onChange(['draft', 'published', 'not-a-status']);
      });

      expect(result.current.selectedFilters.status).toEqual(['draft', 'published']);
      expect(result.current.toolbarProps.activeFiltersCount).toBe(2);
    });

    it('sets language filters and keeps only valid WorksLanguageValue entries', () => {
      const { result } = renderHook(() => useWorksFiltering());
      const languageFilter = result.current.toolbarProps.filters!.find((f) => f.id === 'language')!;

      act(() => {
        languageFilter.onChange(['uk', 'klingon', 'bilingual']);
      });

      expect(result.current.selectedFilters.language).toEqual(['uk', 'bilingual']);
      expect(result.current.toolbarProps.activeFiltersCount).toBe(2);
    });

    it('accumulates activeFiltersCount across all two filter groups', () => {
      const { result } = renderHook(() => useWorksFiltering());
      const filters = result.current.toolbarProps.filters!;

      act(() => {
        filters.find((f) => f.id === 'status')!.onChange(['draft']);
      });
      act(() => {
        filters.find((f) => f.id === 'language')!.onChange(['uk', 'en']);
      });

      expect(result.current.toolbarProps.activeFiltersCount).toBe(3);
    });

    it('clears all filters via onClearFilters', () => {
      const { result } = renderHook(() => useWorksFiltering());
      const filters = result.current.toolbarProps.filters!;

      act(() => {
        filters.find((f) => f.id === 'status')!.onChange(['draft']);
      });
      act(() => {
        filters.find((f) => f.id === 'language')!.onChange(['uk']);
      });
      expect(result.current.toolbarProps.activeFiltersCount).toBe(2);

      act(() => {
        result.current.toolbarProps.onClearFilters!();
      });

      expect(result.current.selectedFilters).toEqual({ status: [], language: [] });
      expect(result.current.toolbarProps.activeFiltersCount).toBe(0);
    });
  });

  describe('sort field change', () => {
    it('switches from date to name using the name default when current value has no name variant selected', () => {
      const { result } = renderHook(() => useWorksFiltering());

      act(() => {
        result.current.sortProps.onFieldChange('name');
      });

      expect(result.current.sortValue).toBe('name_asc');
      expect(window.localStorage.getItem(SORT_STORAGE_KEY)).toBe('name_asc');
    });

    it('switches from name back to date using the date default', () => {
      const { result } = renderHook(() => useWorksFiltering());

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
      const { result } = renderHook(() => useWorksFiltering());

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
      const { result } = renderHook(() => useWorksFiltering());

      act(() => {
        result.current.sortProps.onValueChange('name_desc');
      });

      expect(result.current.sortValue).toBe('name_desc');
      expect(result.current.sortProps.fieldValue).toBe('name');
      expect(result.current.sortProps.triggerLabel).toBe('Назва (Я-А)');
      expect(window.localStorage.getItem(SORT_STORAGE_KEY)).toBe('name_desc');
    });

    it('uses fallback first sort option when sortValue is not found in SORT_OPTIONS', () => {
      const { result } = renderHook(() => useWorksFiltering());

      act(() => {
        result.current.sortProps.onValueChange('invalid_sort_value' as unknown as FilesSortValue);
      });

      expect(result.current.sortValue).toBe('invalid_sort_value');
      expect(result.current.sortProps.triggerLabel).toBe('Дата (нові)');
    });
  });

  describe('referential stability', () => {
    it('keeps toolbarProps and sortProps stable across unrelated rerenders', () => {
      const { result, rerender } = renderHook(() => useWorksFiltering());

      const firstToolbarProps = result.current.toolbarProps;
      const firstSortProps = result.current.sortProps;

      rerender();

      expect(result.current.toolbarProps).toBe(firstToolbarProps);
      expect(result.current.sortProps).toBe(firstSortProps);
    });

    it('produces a new toolbarProps reference after search changes', () => {
      const { result } = renderHook(() => useWorksFiltering());
      const firstToolbarProps = result.current.toolbarProps;

      act(() => {
        result.current.toolbarProps.search!.setSearch('нове значення');
      });

      expect(result.current.toolbarProps).not.toBe(firstToolbarProps);
    });
  });
});
