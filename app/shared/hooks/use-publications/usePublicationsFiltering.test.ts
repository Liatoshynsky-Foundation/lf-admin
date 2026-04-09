import { act, renderHook } from '@testing-library/react';

import { usePublicationsFiltering } from './usePublicationsFiltering';

describe('usePublicationsFiltering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('builds backend request filters from toolbar state', () => {
    const { result } = renderHook(() => usePublicationsFiltering());

    expect(result.current.requestFilters.news.sort).toEqual([{ field: 'createdAt', order: 'desc' }]);
    expect(result.current.requestFilters.media.sort).toEqual([{ field: 'createdAt', order: 'desc' }]);

    act(() => {
      result.current.toolbarProps.search?.setSearch(' фестиваль ');
      result.current.toolbarProps.filters?.[0]?.onChange(['published_with_draft']);
      result.current.toolbarProps.filters?.[1]?.onChange(['bilingual']);
    });

    expect(result.current.requestFilters.news).toEqual({
      search: 'фестиваль',
      languages: ['bilingual'],
      statuses: ['editing'],
      sort: [{ field: 'createdAt', order: 'desc' }]
    });
    expect(result.current.requestFilters.media).toEqual({
      search: 'фестиваль',
      languages: ['bilingual'],
      statuses: ['editing'],
      sort: [{ field: 'createdAt', order: 'desc' }]
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
      { field: 'adminTitle', order: 'asc' },
      { field: 'createdAt', order: 'desc' }
    ]);
    expect(result.current.toolbarProps.search?.options).toEqual([]);
  });
});