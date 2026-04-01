import { act, renderHook } from '@testing-library/react';

import { useFilesFiltering } from './useFilesFiltering';

const items = [
  {
    id: 'asset-image',
    name: 'piano-studio.jpg',
    type: 'image' as const,
    dateAdded: '19.03.2026',
    createdAtRaw: '2026-03-19T10:00:00.000Z',
    format: 'jpg',
    isStarred: true,
    usage: [{ label: 'about-us' }]
  },
  {
    id: 'asset-doc',
    name: 'documents.zip',
    type: 'pdf' as const,
    dateAdded: '18.03.2026',
    createdAtRaw: '2026-03-18T10:00:00.000Z',
    format: 'zip',
    isStarred: false,
    usage: []
  }
];

describe('useFilesFiltering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('filters items by search query', () => {
    const { result } = renderHook(() => useFilesFiltering(items, 'all'));

    expect(result.current.filteredFiles).toHaveLength(2);

    act(() => {
      result.current.toolbarProps.search?.setSearch('piano');
    });

    expect(result.current.filteredFiles).toHaveLength(1);
    expect(result.current.filteredFiles[0]?.id).toBe('asset-image');
  });

  it('applies filter, tab and sort state outside the page component', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result, rerender } = renderHook(({ activeTab }) => useFilesFiltering(items, activeTab), {
      initialProps: { activeTab: 'all' as const }
    });

    act(() => {
      result.current.toolbarProps.filters?.[0]?.onChange(['zip']);
    });

    expect(result.current.filteredFiles).toHaveLength(1);
    expect(result.current.filteredFiles[0]?.id).toBe('asset-doc');

    act(() => {
      result.current.toolbarProps.onClearFilters?.();
    });

    rerender({ activeTab: 'favorites' as const });

    expect(result.current.filteredFiles).toHaveLength(1);
    expect(result.current.filteredFiles[0]?.id).toBe('asset-image');

    act(() => {
      result.current.sortProps.onFieldChange('name');
    });

    expect(setItemSpy).toHaveBeenCalledWith('files_sort', 'name_asc');
    expect(result.current.sortProps.triggerLabel).toBe('А→Я');
  });
});