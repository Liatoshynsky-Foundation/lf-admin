import { act, renderHook } from '@testing-library/react';

import { usePublicationsFiltering } from './usePublicationsFiltering';
import type { PublicationsTabValue } from '~/constants/publications';

const items = [
  {
    id: 'event-1',
    title: 'Вечір камерної музики',
    type: 'events' as const,
    dateAdded: '19.03.2026',
    createdAtRaw: '2026-03-19T10:00:00.000Z',
    status: 'draft' as const,
    language: 'uk' as const
  },
  {
    id: 'news-1',
    title: 'Новина про фестиваль',
    type: 'news' as const,
    dateAdded: '21.03.2026',
    createdAtRaw: '2026-03-21T10:00:00.000Z',
    status: 'published' as const,
    language: 'en' as const
  },
  {
    id: 'media-1',
    title: 'Стаття в національному медіа',
    type: 'media' as const,
    dateAdded: '23.03.2026',
    createdAtRaw: '2026-03-23T10:00:00.000Z',
    status: 'published_with_draft' as const,
    language: 'bilingual' as const
  }
];

describe('usePublicationsFiltering', () => {
  type HookProps = {
    activeTab: PublicationsTabValue;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('filters items by search query', () => {
    const { result } = renderHook(() => usePublicationsFiltering(items, 'all'));

    expect(result.current.filteredItems).toHaveLength(3);

    act(() => {
      result.current.toolbarProps.search?.setSearch('фестиваль');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.id).toBe('news-1');
  });

  it('applies filter, tab and sort state outside the page component', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result, rerender } = renderHook(({ activeTab }: HookProps) => usePublicationsFiltering(items, activeTab), {
      initialProps: { activeTab: 'all' }
    });

    act(() => {
      result.current.toolbarProps.filters?.[0]?.onChange(['published']);
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.id).toBe('news-1');

    act(() => {
      result.current.toolbarProps.onClearFilters?.();
    });

    rerender({ activeTab: 'media' });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.id).toBe('media-1');

    act(() => {
      result.current.sortProps.onFieldChange('name');
    });

    expect(setItemSpy).toHaveBeenCalledWith('publications_sort', 'name_asc');
    expect(result.current.sortProps.triggerLabel).toBe('А→Я');
  });

  it('deduplicates search options with identical titles', () => {
    const duplicatedItems = [
      ...items,
      {
        id: 'news-2',
        title: 'Новина про фестиваль',
        type: 'news' as const,
        dateAdded: '24.03.2026',
        createdAtRaw: '2026-03-24T10:00:00.000Z',
        status: 'draft' as const,
        language: 'uk' as const
      }
    ];

    const { result } = renderHook(() => usePublicationsFiltering(duplicatedItems, 'all'));

    expect(result.current.toolbarProps.search?.options).toEqual([
      { id: 'event-1', title: 'Вечір камерної музики' },
      { id: 'news-1', title: 'Новина про фестиваль' },
      { id: 'media-1', title: 'Стаття в національному медіа' }
    ]);
  });
});