'use client';

import { useState } from 'react';

import type { ResearchWorkStatus } from './research.mock';
import { RESEARCH_STATUS_OPTIONS, SORT_STORAGE_KEY } from '~/constants/research';
import { type FilesSortValue, SORT_FIELD_OPTIONS, SORT_ORDER_OPTIONS, type SortFieldValue } from '~/constants/sort';
import type { FilteringToolbarProps, SortSelectProps } from '~/shared/components/filtering-toolbar';
import type { FilterOption } from '~/shared/components/selector/FilterSelect';
import { useSortValue } from '~/shared/hooks/use-sort-value/useSortValue';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const isResearchStatusValue = (value: string): value is ResearchWorkStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

export type ResearchWorksFilteringToolbarProps = Pick<FilteringToolbarProps, 'search'>;

export type ResearchWorksFilteringSortProps = Omit <
  SortSelectProps<SortFieldValue, FilesSortValue>,
  'minWidth' | 'dataTestId'
>;

export type ResearchStatusFilterProps = Readonly<{
  label: string;
  options: readonly FilterOption[];
  value: string[];
  hideClearAction: boolean;
  onChange: (value: string[]) => void;
}>;

export function useResearchWorksFiltering(): Readonly<{
  sortValue: FilesSortValue;
  selectedFilters: Readonly<{ status: readonly ResearchWorkStatus[] }>;
  toolbarProps: ResearchWorksFilteringToolbarProps;
  sortProps: ResearchWorksFilteringSortProps;
  statusFilterProps: ResearchStatusFilterProps;
  activeFiltersCount: number;
}> {
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<ResearchWorkStatus[]>([]);

  const { sortValue, currentSortField, currentSortOption, handleSortFieldChange, handleSortValueChange } =
    useSortValue(SORT_STORAGE_KEY);

  const activeFiltersCount = statusFilters.length;

  const toolbarProps: ResearchWorksFilteringToolbarProps = {
    search: {
      search,
      setSearch,
      options: [],
      placeholder: 'Пошук'
    }
  };

  const statusFilterProps: ResearchStatusFilterProps = {
    label: 'Статус',
    options: RESEARCH_STATUS_OPTIONS,
    value: statusFilters,
    hideClearAction: true,
    onChange: (value: string[]) => setStatusFilters(value.filter(isResearchStatusValue))
  };

  const sortProps: ResearchWorksFilteringSortProps = {
    fieldOptions: SORT_FIELD_OPTIONS,
    orderOptions: SORT_ORDER_OPTIONS,
    fieldValue: currentSortField,
    value: sortValue,
    triggerLabel: currentSortOption.label,
    onFieldChange: handleSortFieldChange,
    onValueChange: handleSortValueChange
  };

  return {
    sortValue,
    selectedFilters: { status: statusFilters },
    toolbarProps,
    sortProps,
    statusFilterProps,
    activeFiltersCount
  };
}