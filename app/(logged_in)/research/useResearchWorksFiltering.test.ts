import { act, renderHook } from '@testing-library/react';

import { RESEARCH_WORKS_DEFAULT_SORT, useResearchWorksFiltering } from './useResearchWorksFiltering';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { ResearchWorkStatus } from '~/types/graphql/generated/graphql';

describe('useResearchWorksFiltering', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with empty search/status and the default sort cascade', () => {
    const { result } = renderHook(() => useResearchWorksFiltering());

    expect(result.current.searchValue).toBe('');
    expect(result.current.selectedFilters.status).toEqual([]);
    expect(result.current.activeFiltersCount).toBe(0);
    expect(result.current.requestFilters).toEqual({
      sort: RESEARCH_WORKS_DEFAULT_SORT
    });
  });

  it('debounces search into requestFilters.search', () => {
    const { result } = renderHook(() => useResearchWorksFiltering());

    act(() => {
      result.current.toolbarProps.search!.setSearch('ковик');
    });

    expect(result.current.requestFilters.search).toBeUndefined();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.searchValue).toBe('ковик');
    expect(result.current.requestFilters.search).toBe('ковик');
  });

  it('maps selected statuses to GraphQL filters and ignores invalid values', () => {
    const { result } = renderHook(() => useResearchWorksFiltering());

    act(() => {
      result.current.statusFilterProps.onChange?.([
        BaseContentStatuses.Published,
        'not-a-status'
      ]);
    });

    expect(result.current.selectedFilters.status).toEqual([BaseContentStatuses.Published]);
    expect(result.current.activeFiltersCount).toBe(1);
    expect(result.current.requestFilters.statuses).toEqual([ResearchWorkStatus.Published]);
  });

  it('replaces the previous status when another option is selected', () => {
    const { result } = renderHook(() => useResearchWorksFiltering());

    act(() => {
      result.current.statusFilterProps.onChange?.([BaseContentStatuses.Published]);
    });
    act(() => {
      result.current.statusFilterProps.onChange?.([BaseContentStatuses.Hidden]);
    });

    expect(result.current.selectedFilters.status).toEqual([BaseContentStatuses.Hidden]);
    expect(result.current.requestFilters.statuses).toEqual([ResearchWorkStatus.Hidden]);
  });
});
