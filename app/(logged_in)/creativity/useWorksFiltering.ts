'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  WORKS_FILTERS,
  WORKS_STATUSES,
  type WorksFilterId,
  type WorksLanguageValue,
  type WorksStatusValue
} from '~/constants/creativity';
import {
  type FilesSortValue,
  SORT_FIELD_OPTIONS,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  type SortFieldValue
} from '~/constants/sort';
import type { FilteringToolbarProps, SortSelectProps } from '~/shared/components/filtering-toolbar';
import { useDebounce } from '~/shared/hooks/use-debounce/useDebounce';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  OpusStatus,
  SortOrder,
  type WorksFiltersInput,
  WorksSortBy,
  type WorksSortOptions
} from '~/types/graphql/generated/graphql';

const SORT_STORAGE_KEY = 'works_sort';

const isWorksStatusValue = (value: string): value is WorksStatusValue =>
  WORKS_STATUSES.includes(value as WorksStatusValue);

const isWorksLanguageValue = (value: string): value is WorksLanguageValue =>
  value === 'uk' || value === 'en' || value === 'bilingual';

export type WorksFilteringToolbarProps = Pick<
  FilteringToolbarProps,
  'search' | 'filters' | 'isFiltersOpen' | 'onToggleFilters' | 'activeFiltersCount' | 'onClearFilters'
>;

export type WorksFilteringSortProps = Omit<
  SortSelectProps<SortFieldValue, FilesSortValue>,
  'minWidth' | 'dataTestId'
>;

const VALID_SORT_VALUES: ReadonlySet<string> = new Set(['date_desc', 'date_asc', 'name_asc', 'name_desc']);

const isFilesSortValue = (value: string): value is FilesSortValue => VALID_SORT_VALUES.has(value);

const mapWorksStatus = (status: WorksStatusValue): OpusStatus => {
  if (status === BaseContentStatuses.Published) {
    return OpusStatus.Published;
  }
  return OpusStatus.Draft;
};

const mapWorksSort = (sortValue: FilesSortValue): WorksSortOptions[] => {
  if (sortValue === 'name_asc') {
    return [{ field: WorksSortBy.Number, order: SortOrder.Asc }];
  }
  if (sortValue === 'name_desc') {
    return [{ field: WorksSortBy.Number, order: SortOrder.Desc }];
  }
  if (sortValue === 'date_asc') {
    return [{ field: WorksSortBy.CreatedAt, order: SortOrder.Asc }];
  }
  return [{ field: WorksSortBy.CreatedAt, order: SortOrder.Desc }];
};

export function useWorksFiltering(): Readonly<{
  requestFilters: Omit<WorksFiltersInput, 'limit' | 'skip'>;
  sortValue: FilesSortValue;
  selectedFilters: Readonly<{
    status: readonly WorksStatusValue[];
    language: readonly WorksLanguageValue[];
  }>;
  toolbarProps: WorksFilteringToolbarProps;
  sortProps: WorksFilteringSortProps;
}> {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const debouncedSearch = useDebounce(search.trim(), 300);

  const [statusFilters, setStatusFilters] = useState<WorksStatusValue[]>([]);
  const [languageFilters, setLanguageFilters] = useState<WorksLanguageValue[]>([]);
  const [sortValue, setSortValue] = useState<FilesSortValue>(() => {
    if (typeof window === 'undefined') return 'date_desc';
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    return saved && isFilesSortValue(saved) ? saved : 'date_desc';
  });

  useEffect(() => {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (saved && isFilesSortValue(saved)) setSortValue(saved);
  }, []);

  const activeFiltersCount = statusFilters.length + languageFilters.length;
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((previous) => !previous);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters([]);
    setLanguageFilters([]);
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

  const filterConfigs = useMemo(
    () => {
      const filterValues: Record<WorksFilterId, string[]> = {
        status: statusFilters,
        language: languageFilters,
      };

      const filterOnChange: Record<WorksFilterId, (value: string[]) => void> = {
        status: (value) => setStatusFilters(value.filter(isWorksStatusValue)),
        language: (value) => setLanguageFilters(value.filter(isWorksLanguageValue)),
      };

      return WORKS_FILTERS.map((filter) => ({
        id: filter.id,
        label: filter.label,
        options: filter.options,
        value: filterValues[filter.id],
        hideClearAction: true,
        menuMinWidth: filter.menuMinWidth,
        onChange: filterOnChange[filter.id]
      }));
    },
    [statusFilters, languageFilters]
  );

  const toolbarProps: WorksFilteringToolbarProps = useMemo(
    () => ({
      search: {
        search,
        setSearch,
        options: [],
        placeholder: 'Пошук'
      },
      filters: filterConfigs,
      isFiltersOpen,
      onToggleFilters: toggleFilters,
      activeFiltersCount,
      onClearFilters: clearFilters
    }),
    [search, filterConfigs, isFiltersOpen, toggleFilters, activeFiltersCount, clearFilters]
  );

  const sortProps: WorksFilteringSortProps = useMemo(
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

  const requestFilters = useMemo<Omit<WorksFiltersInput, 'limit' | 'skip'>>(
    () => ({
      search: debouncedSearch || undefined,
      statuses: statusFilters.length ? statusFilters.map(mapWorksStatus) : undefined,
      sort: mapWorksSort(sortValue)
    }),
    [debouncedSearch, statusFilters, sortValue]
  );

  return {
    requestFilters,
    sortValue,
    selectedFilters: {
      status: statusFilters,
      language: languageFilters,
    },
    toolbarProps,
    sortProps
  };
}
