'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  WORKS_FILTERS,
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

const SORT_STORAGE_KEY = 'works_sort';

export type WorksFilteringToolbarProps = Pick<
  FilteringToolbarProps,
  'search' | 'filters' | 'isFiltersOpen' | 'onToggleFilters' | 'activeFiltersCount' | 'onClearFilters'
>;

export type WorksFilteringSortProps = Omit<
  SortSelectProps<SortFieldValue, FilesSortValue>,
  'minWidth' | 'dataTestId'
>;

const getInitialSortValue = (): FilesSortValue => {
  if (globalThis.window === undefined) {
    return 'date_desc';
  }

  const saved = localStorage.getItem(SORT_STORAGE_KEY);
  const validValues: FilesSortValue[] = ['date_desc', 'date_asc', 'name_asc', 'name_desc'];
  return (validValues.includes(saved as FilesSortValue) ? saved : 'date_desc') as FilesSortValue;
};

export function useWorksFiltering(): Readonly<{
  sortValue: FilesSortValue;
  selectedFilters: Readonly<{
    status: readonly WorksStatusValue[];
    language: readonly WorksLanguageValue[];
    genre: readonly string[];
  }>;
  toolbarProps: WorksFilteringToolbarProps;
  sortProps: WorksFilteringSortProps;
}> {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<WorksStatusValue[]>([]);
  const [languageFilters, setLanguageFilters] = useState<WorksLanguageValue[]>([]);
  const [genreFilters, setGenreFilters] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<FilesSortValue>(getInitialSortValue);

  const activeFiltersCount = statusFilters.length + languageFilters.length + genreFilters.length;
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((previous) => !previous);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters([]);
    setLanguageFilters([]);
    setGenreFilters([]);
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
        genre: genreFilters
      };

      const filterOnChange: Record<WorksFilterId, (value: string[]) => void> = {
        status: (value) => setStatusFilters(value as WorksStatusValue[]),
        language: (value) => setLanguageFilters(value as WorksLanguageValue[]),
        genre: (value) => setGenreFilters(value)
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
    [statusFilters, languageFilters, genreFilters]
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

  return {
    sortValue,
    selectedFilters: {
      status: statusFilters,
      language: languageFilters,
      genre: genreFilters
    },
    toolbarProps,
    sortProps
  };
}
