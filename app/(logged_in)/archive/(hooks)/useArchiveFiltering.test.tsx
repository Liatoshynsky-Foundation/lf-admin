import { act, renderHook } from '@testing-library/react';

import { useArchiveFiltering } from './useArchiveFiltering';
import { ARCHIVE_STATUS_FILTER_OPTIONS } from '~/constants/archive';

describe('useArchiveFiltering', () => {
  it('should return initial values correctly', () => {
    const { result } = renderHook(() => useArchiveFiltering());

    expect(result.current).toStrictEqual({
      activeStatusFilters: [],
      searchProps: {
        search: '',
        options: [],
        placeholder: 'Пошук за назвою фонду, назвою справи або змістом документів',
        maxWidth: '580px',
        setSearch: expect.any(Function)
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
});