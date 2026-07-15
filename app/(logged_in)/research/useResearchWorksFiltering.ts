'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ResearchWorkStatus } from './research.mock';
import { type FilesSortValue, SORT_FIELD_OPTIONS, SORT_OPTIONS,SORT_ORDER_OPTIONS, type SortFieldValue } from '~/constants/sort';
import type { FilteringToolbarProps, SortSelectProps } from '~/shared/components/filtering-toolbar';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const SORT_STORAGE_KEY = 'research_works_sort';

const RESEARCH_STATUS_OPTIONS = [
  { value: BaseContentStatuses.Published, label: 'Опубліковано' },
  { value: BaseContentStatuses.Hidden, label: 'Приховано' }
] as const;

const isResearchStatusValue = (value: string): value is ResearchWorkStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

const VALID_SORT_VALUES: ReadonlySet<string> = new Set(['date_desc', 'date_asc', 'name_asc', 'name_desc']);
const isFilesSortValue = (value: string): value is FilesSortValue => VALID_SORT_VALUES.has(value);

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
  const [sortValue, setSortValue] = useState<FilesSortValue>('date_desc');

  useEffect(() => {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (saved && isFilesSortValue(saved)) {
      setSortValue(saved);
    }
  }, []);

  const activeFiltersCount = statusFilters.length;
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((previous) => !previous);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters([]);
  }, []);

  const handleSortFieldChange = useCallback((field: SortFieldValue) => {
    setSortValue((previous) => {
      const isDate = field === 'date';
      const prefix = isDate ? 'date' : 'name';
      const defaultSort: FilesSortValue = isDate ? 'date_desc' : 'name_asc';
      const nextValue: FilesSortValue = previous.startsWith(prefix) ? (previous as FilesSortValue) : defaultSort;
      localStorage.setItem(SORT_STORAGE_KEY, nextValue);
      return nextValue;
    });
  }, []);

  const handleSortValueChange = useCallback((nextValue: FilesSortValue) => {
    setSortValue(nextValue);
    localStorage.setItem(SORT_STORAGE_KEY, nextValue);
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