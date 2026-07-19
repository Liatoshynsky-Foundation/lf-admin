import { act, renderHook } from '@testing-library/react';

import { usePublicationsFiltering } from './usePublicationsFiltering';
import { EventSortBy, MediaMentionsSortBy, NewsSortBy } from '~/types/graphql/generated/graphql';

describe('usePublicationsFiltering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('builds backend request filters from toolbar state', () => {
    const { result } = renderHook(() => usePublicationsFiltering());

    expect(result.current.requestFilters.news.sort).toEqual([{ field: NewsSortBy.CreatedAt, order: 'desc' }]);
    expect(result.current.requestFilters.media.sort).toEqual([{ field: MediaMentionsSortBy.CreatedAt, order: 'desc' }]);
    expect(result.current.requestFilters.events.sort).toEqual([{ field: EventSortBy.CreatedAt, order: 'desc' }]);

    act(() => {
      result.current.toolbarProps.search?.setSearch(' фестиваль ');
      const onChange = result.current.toolbarProps.filters?.[0]?.onChange;
      if (onChange) {
        onChange(['editing']);
      }
    });

    expect(result.current.requestFilters.news).toEqual({
      search: 'фестиваль',
      statuses: ['editing'],
      sort: [{ field: NewsSortBy.CreatedAt, order: 'desc' }]
    });
    expect(result.current.requestFilters.media).toEqual({
      search: 'фестиваль',
      statuses: ['editing'],
      sort: [{ field: MediaMentionsSortBy.CreatedAt, order: 'desc' }]
    });
    expect(result.current.requestFilters.events).toEqual({
      search: 'фестиваль',
      statuses: ['editing'],
      sort: [{ field: EventSortBy.CreatedAt, order: 'desc' }]
    });
  });

  it('persists sort state and exposes updated server sort params', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => usePublicationsFiltering());

    act(() => {
      result.current.sortProps.onFieldChange('name');
    });

    expect(setItemSpy).toHaveBeenCalledWith('publications_sort', 'name_asc');
    expect(result.current.sortProps.triggerLabel).toBe('А→Я');
    expect(result.current.requestFilters.news.sort).toEqual([
      { field: NewsSortBy.AdminTitle, order: 'asc' },
      { field: NewsSortBy.CreatedAt, order: 'desc' }
    ]);
    expect(result.current.requestFilters.media.sort).toEqual([
      { field: MediaMentionsSortBy.AdminTitle, order: 'asc' },
      { field: MediaMentionsSortBy.CreatedAt, order: 'desc' }
    ]);
    expect(result.current.requestFilters.events.sort).toEqual([
      { field: EventSortBy.AdminTitle, order: 'asc' },
      { field: EventSortBy.CreatedAt, order: 'desc' }
    ]);
    expect(result.current.toolbarProps.search?.options).toEqual([]);
  });

  it('returns default sort when window is undefined', () => {
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, 'window', {
      get() {
        const stack = new Error().stack || '';
        if (stack.includes('getInitialSortValue')) {
          return undefined;
        }
        return originalWindow;
      },
      configurable: true
    });

    try {
      const { result } = renderHook(() => usePublicationsFiltering());
      expect(result.current.sortValue).toBe('date_desc');
    } finally {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true
      });
    }
  });

  it('initializes with a saved valid sort value from localStorage', () => {
    localStorage.setItem('publications_sort', 'date_asc');
    const { result } = renderHook(() => usePublicationsFiltering());
    expect(result.current.sortValue).toBe('date_asc');
  });

  it('initializes with default sort when saved value in localStorage is invalid', () => {
    localStorage.setItem('publications_sort', 'invalid_option');
    const { result } = renderHook(() => usePublicationsFiltering());
    expect(result.current.sortValue).toBe('date_desc');
  });

  it('toggles filters', () => {
    const { result } = renderHook(() => usePublicationsFiltering());
    expect(result.current.toolbarProps.isFiltersOpen).toBe(false);

    act(() => {
      result.current.toolbarProps.onToggleFilters?.();
    });
    expect(result.current.toolbarProps.isFiltersOpen).toBe(true);

    act(() => {
      result.current.toolbarProps.onToggleFilters?.();
    });
    expect(result.current.toolbarProps.isFiltersOpen).toBe(false);
  });

  it('clears active status filters', () => {
    const { result } = renderHook(() => usePublicationsFiltering());

    act(() => {
      const onChange = result.current.toolbarProps.filters?.[0]?.onChange;
      if (onChange) {
        onChange(['editing', 'published']);
      }
    });
    expect(result.current.toolbarProps.activeFiltersCount).toBe(2);

    act(() => {
      result.current.toolbarProps.onClearFilters?.();
    });
    expect(result.current.toolbarProps.activeFiltersCount).toBe(0);
  });

  it('handles sort value change via onValueChange', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => usePublicationsFiltering());

    act(() => {
      result.current.sortProps.onValueChange('name_desc');
    });

    expect(setItemSpy).toHaveBeenCalledWith('publications_sort', 'name_desc');
    expect(result.current.sortValue).toBe('name_desc');
    expect(result.current.requestFilters.news.sort).toEqual([
      { field: NewsSortBy.AdminTitle, order: 'desc' },
      { field: NewsSortBy.CreatedAt, order: 'desc' }
    ]);
  });

  it('handles sort field change to date when current sort does not start with date', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => usePublicationsFiltering());

    act(() => {
      result.current.sortProps.onFieldChange('name');
    });
    expect(result.current.sortValue).toBe('name_asc');

    act(() => {
      result.current.sortProps.onFieldChange('date');
    });
    expect(setItemSpy).toHaveBeenCalledWith('publications_sort', 'date_desc');
    expect(result.current.sortValue).toBe('date_desc');
  });

  it('handles sort field change to date when current sort already starts with date', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    localStorage.setItem('publications_sort', 'date_asc');
    const { result } = renderHook(() => usePublicationsFiltering());
    expect(result.current.sortValue).toBe('date_asc');

    act(() => {
      result.current.sortProps.onFieldChange('date');
    });
    expect(setItemSpy).toHaveBeenCalledWith('publications_sort', 'date_asc');
    expect(result.current.sortValue).toBe('date_asc');
    expect(result.current.requestFilters.news.sort).toEqual([{ field: NewsSortBy.CreatedAt, order: 'asc' }]);
  });

  it('handles sort field change to name when current sort already starts with name', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    localStorage.setItem('publications_sort', 'name_desc');
    const { result } = renderHook(() => usePublicationsFiltering());
    expect(result.current.sortValue).toBe('name_desc');

    act(() => {
      result.current.sortProps.onFieldChange('name');
    });
    expect(setItemSpy).toHaveBeenCalledWith('publications_sort', 'name_desc');
    expect(result.current.sortValue).toBe('name_desc');
  });
});
