import { act, renderHook } from '@testing-library/react';

import { useSortValue } from './useSortValue';

jest.mock('~/constants/sort', () => ({
  SORT_OPTIONS: [
    { value: 'date_desc', label: 'Дата (нові)' },
    { value: 'date_asc', label: 'Дата (старі)' },
    { value: 'name_asc', label: 'Назва (А-Я)' },
    { value: 'name_desc', label: 'Назва (Я-А)' }
  ]
}));

const STORAGE_KEY = 'test_sort_key';

describe('useSortValue', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with date_desc as the default sort value', () => {
      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      expect(result.current.sortValue).toBe('date_desc');
      expect(result.current.currentSortField).toBe('date');
      expect(result.current.currentSortOption.label).toBe('Дата (нові)');
    });
  });

  describe('reading sort value from localStorage on mount', () => {
    it('applies a valid stored sort value', () => {
      window.localStorage.setItem(STORAGE_KEY, 'name_asc');

      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      expect(result.current.sortValue).toBe('name_asc');
      expect(result.current.currentSortField).toBe('name');
      expect(result.current.currentSortOption.label).toBe('Назва (А-Я)');
    });

    it('ignores an invalid stored sort value and keeps the default', () => {
      window.localStorage.setItem(STORAGE_KEY, 'totally_invalid');

      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      expect(result.current.sortValue).toBe('date_desc');
    });

    it('keeps the default when nothing is stored', () => {
      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      expect(result.current.sortValue).toBe('date_desc');
    });

    it('reads from the storage key that was passed in, independent of other keys', () => {
      window.localStorage.setItem('other_key', 'name_desc');
      window.localStorage.setItem(STORAGE_KEY, 'date_asc');

      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      expect(result.current.sortValue).toBe('date_asc');
    });
  });

  describe('handleSortFieldChange', () => {
    it('switches from date to name using the name default when no name variant was selected', () => {
      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      act(() => {
        result.current.handleSortFieldChange('name');
      });

      expect(result.current.sortValue).toBe('name_asc');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('name_asc');
    });

    it('switches from name back to date using the date default', () => {
      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      act(() => {
        result.current.handleSortFieldChange('name');
      });
      act(() => {
        result.current.handleSortFieldChange('date');
      });

      expect(result.current.sortValue).toBe('date_desc');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('date_desc');
    });

    it('preserves the current value when switching to a field that already matches the prefix', () => {
      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      act(() => {
        result.current.handleSortValueChange('date_asc');
      });
      act(() => {
        result.current.handleSortFieldChange('date');
      });

      expect(result.current.sortValue).toBe('date_asc');
    });
  });

  describe('handleSortValueChange', () => {
    it('sets an explicit sort value and persists it to localStorage', () => {
      const { result } = renderHook(() => useSortValue(STORAGE_KEY));

      act(() => {
        result.current.handleSortValueChange('name_desc');
      });

      expect(result.current.sortValue).toBe('name_desc');
      expect(result.current.currentSortField).toBe('name');
      expect(result.current.currentSortOption.label).toBe('Назва (Я-А)');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('name_desc');
    });
  });

  describe('multiple instances with different storage keys', () => {
    it('keeps sort state independent between different storage keys', () => {
      const { result: firstHook } = renderHook(() => useSortValue('key_one'));
      const { result: secondHook } = renderHook(() => useSortValue('key_two'));

      act(() => {
        firstHook.current.handleSortValueChange('name_asc');
      });

      expect(firstHook.current.sortValue).toBe('name_asc');
      expect(secondHook.current.sortValue).toBe('date_desc');
    });
  });
});