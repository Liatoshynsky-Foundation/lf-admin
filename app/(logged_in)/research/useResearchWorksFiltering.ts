'use client';

import { useCallback, useMemo, useState } from 'react';

import type { ResearchWorkStatus } from './research.mock';
import { type FilesSortValue, SORT_FIELD_OPTIONS, SORT_ORDER_OPTIONS, type SortFieldValue } from '~/constants/sort';
import type { FilteringToolbarProps, SortSelectProps } from '~/shared/components/filtering-toolbar';
import { useSortValue } from '~/shared/hooks/use-sort-value/useSortValue';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const SORT_STORAGE_KEY = 'research_works_sort';

const RESEARCH_STATUS_OPTIONS = [
  { value: BaseContentStatuses.Published, label: 'Опубліковано' },
  { value: BaseContentStatuses.Hidden, label: 'Приховано' }
] as const;

const isResearchStatusValue = (value: string): value is ResearchWorkStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

export type ResearchWorksFilteringToolbarProps = Pick <
  FilteringToolbarProps,
  'search' | 'filters' | 'isFiltersOpen' | 'onToggleFilters' | 'activeFiltersCount' | 'onClearFilters'
>;

export type ResearchWorksFilteringSortProps = Omit <
  SortSelectProps<SortFieldValue, FilesSortValue>,
  'minWidth' | 'dataTestId'
>;

export function useResearchWorksFiltering(): Readonly<{
  sortValue: FilesSortValue;
  selectedFilters: Readonly<{ status: readonly ResearchWorkStatus[] }>;
  toolbarProps: ResearchWorksFilteringToolbarProps;
  sortProps: ResearchWorksFilteringSortProps;
}> {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<ResearchWorkStatus[]>([]);

  const { sortValue, currentSortField, currentSortOption, handleSortFieldChange, handleSortValueChange } =
    useSortValue(SORT_STORAGE_KEY);

  const activeFiltersCount = statusFilters.length;

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((previous) => !previous);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters([]);
  }, []);

  const toolbarProps: ResearchWorksFilteringToolbarProps = useMemo(
    () => ({
      search: {
        search,
        setSearch,
        options: [],
        placeholder: 'Пошук'
      },
      filters: [
        {
          id: 'status',
          label: 'Статус',
          options: RESEARCH_STATUS_OPTIONS,
          value: statusFilters,
          hideClearAction: true,
          onChange: (value: string[]) => setStatusFilters(value.filter(isResearchStatusValue))
        }
      ],
      isFiltersOpen,
      onToggleFilters: toggleFilters,
      activeFiltersCount,
      onClearFilters: clearFilters
    }),
    [search, statusFilters, isFiltersOpen, toggleFilters, activeFiltersCount, clearFilters]
  );

  const sortProps: ResearchWorksFilteringSortProps = useMemo(
    () => ({
      fieldOptions: SORT_FIELD_OPTIONS,
      orderOptions: SORT_ORDER_OPTIONS,
      fieldValue: currentSortField,
      value: sortValue,
      triggerLabel: currentSortOption.label,
      onFieldChange: handleSortFieldChange,
      onValueChange: handleSortValueChange
    }),
    [currentSortField, currentSortOption.label, handleSortFieldChange, handleSortValueChange, sortValue]
  );

  return {
    sortValue,
    selectedFilters: { status: statusFilters },
    toolbarProps,
    sortProps
  };
}