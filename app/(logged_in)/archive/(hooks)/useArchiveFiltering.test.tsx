import { act, renderHook } from '@testing-library/react';

import { useArchiveFiltering } from './useArchiveFiltering';
import { ARCHIVE_SEARCH_PLACEHOLDER, ARCHIVE_STATUS_FILTER_OPTIONS } from '~/constants/archive';

describe('useArchiveFiltering', () => {
  it('should return initial values correctly', () => {
    const { result } = renderHook(() => useArchiveFiltering());

    expect(result.current).toStrictEqual({
      activeStatusFilters: [],
      appliedSearch: '',
      searchProps: {
        search: '',
        options: [],
        placeholder: ARCHIVE_SEARCH_PLACEHOLDER,
        maxWidth: '580px',
        setSearch: expect.any(Function),
        onEnter: expect.any(Function)
      },
      statusFilterProps: {
        label: 'Статус',
        options: ARCHIVE_STATUS_FILTER_OPTIONS,
        value: [],
        maxSelections: 1,
        hideClearAction: true,
        menuAlign: 'right',
        persistLabel: true,
        onChange: expect.any(Function)
      },
    });
  });

  it('should call update the search value if setSearch is called', ()=>{
    const { result } = renderHook(() => useArchiveFiltering());
    const expectedNewSearchValue = 'new value';

    act(()=>{
      result.current.searchProps.setSearch(expectedNewSearchValue);
    });

    expect(result.current.searchProps.search).toBe(expectedNewSearchValue);
  });
  it('should update the status filters if onChange is called', ()=>{
    const { result } = renderHook(() => useArchiveFiltering());
    const expectedNewValue = ['published'];

    act(()=>{
        result.current.statusFilterProps.onChange!(expectedNewValue);
    });

    expect(result.current.statusFilterProps.value).toStrictEqual(expectedNewValue);
    expect(result.current.activeStatusFilters).toEqual(expectedNewValue);
  });

  it('should set filters to an empty array when onChange is called with an empty array', () => {
    const { result } = renderHook(() => useArchiveFiltering());

    act(() => {
      result.current.statusFilterProps.onChange!(['published']);
    });
    expect(result.current.statusFilterProps.value).toStrictEqual(['published']);

    act(() => {
      result.current.statusFilterProps.onChange!([]);
    });

    expect(result.current.statusFilterProps.value).toStrictEqual([]);
    expect(result.current.activeStatusFilters).toEqual([]);
  });

  describe('appliedSearch', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not apply the typed search before the debounce delay has passed', () => {
      const { result } = renderHook(() => useArchiveFiltering());

      act(() => {
        result.current.searchProps.setSearch('архів');
      });

      act(() => {
        jest.advanceTimersByTime(299);
      });

      expect(result.current.appliedSearch).toBe('');
    });

    it('should apply the trimmed search once the debounce delay has passed', () => {
      const { result } = renderHook(() => useArchiveFiltering());

      act(() => {
        result.current.searchProps.setSearch('  архів  ');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.appliedSearch).toBe('архів');
    });

    it('should apply the trimmed search immediately when onEnter is called', () => {
      const { result } = renderHook(() => useArchiveFiltering());

      act(() => {
        result.current.searchProps.setSearch('  архів  ');
      });

      act(() => {
        result.current.searchProps.onEnter!();
      });

      expect(result.current.appliedSearch).toBe('архів');
    });
  });
});