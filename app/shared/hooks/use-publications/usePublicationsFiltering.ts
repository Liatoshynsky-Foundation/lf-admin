import { useCallback, useMemo, useState } from 'react';

import {
  type FilesSortValue,
  SORT_FIELD_OPTIONS,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  type SortFieldValue
} from '~/constants/files';
import {
  PUBLICATIONS_FILTERS,
  type PublicationsItemType,
  type PublicationsLanguageValue,
  type PublicationsStatusValue,
  type PublicationsTabValue
} from '~/constants/publications';
import type { FilteringToolbarProps, SortSelectProps } from '~/shared/components/filtering-toolbar';
import { normalizeSearch } from '~/shared/utils/normalizeSearch';

const SORT_STORAGE_KEY = 'publications_sort';

export type UsePublicationsFilteringItem = Readonly<{
  id: string;
  title: string;
  searchTitle?: string;
  type: PublicationsItemType;
  dateAdded: string;
  createdAtRaw?: string;
  status: PublicationsStatusValue;
  language: PublicationsLanguageValue;
}>;

export type PublicationsFilteringToolbarProps = Pick<
  FilteringToolbarProps,
  'search' | 'filters' | 'isFiltersOpen' | 'onToggleFilters' | 'activeFiltersCount' | 'onClearFilters'
>;

export type PublicationsFilteringSortProps = Omit<
  SortSelectProps<SortFieldValue, FilesSortValue>,
  'minWidth' | 'dataTestId'
>;

const getInitialSortValue = (): FilesSortValue => {
  if (globalThis.window === undefined) {
    return 'date_desc';
  }

  const saved = localStorage.getItem(SORT_STORAGE_KEY);

  return (SORT_OPTIONS.some((option) => option.value === saved) ? saved : 'date_desc') as FilesSortValue;
};

export function usePublicationsFiltering<Item extends UsePublicationsFilteringItem>(
  allItems: Item[],
  activeTab: PublicationsTabValue = 'all'
): Readonly<{
  filteredItems: Item[];
  toolbarProps: PublicationsFilteringToolbarProps;
  sortProps: PublicationsFilteringSortProps;
}> {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [languageFilters, setLanguageFilters] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<FilesSortValue>(getInitialSortValue);

  const titleOptions = useMemo(() => {
    const uniqueOptions = new Map<string, { id: string; title: string }>();

    allItems.forEach((item) => {
      const normalizedTitle = normalizeSearch(item.title);

      if (!uniqueOptions.has(normalizedTitle)) {
        uniqueOptions.set(normalizedTitle, { id: item.id, title: item.title });
      }
    });

    return Array.from(uniqueOptions.values());
  }, [allItems]);

  const itemsAfterBaseFiltering = useMemo(() => {
    const normalizedValue = normalizeSearch(search);

    const filtered = allItems.filter((item) => {
      const searchableTitle = item.searchTitle ?? item.title;
      const matchesSearch = !normalizedValue || normalizeSearch(searchableTitle).includes(normalizedValue);
      const matchesStatus = !statusFilters.length || statusFilters.includes(item.status);
      const matchesLanguage = !languageFilters.length || languageFilters.includes(item.language);

      return matchesSearch && matchesStatus && matchesLanguage;
    });

    return [...filtered].sort((left, right) => {
      if (sortValue === 'name_asc') {
        return left.title.localeCompare(right.title, 'uk');
      }

      if (sortValue === 'name_desc') {
        return right.title.localeCompare(left.title, 'uk');
      }

      const leftDate = new Date(left.createdAtRaw ?? left.dateAdded).getTime();
      const rightDate = new Date(right.createdAtRaw ?? right.dateAdded).getTime();

      if (sortValue === 'date_asc') {
        return leftDate - rightDate;
      }

      return rightDate - leftDate;
    });
  }, [allItems, languageFilters, search, sortValue, statusFilters]);

  const filteredItems = useMemo<Item[]>(() => {
    if (activeTab === 'all') {
      return itemsAfterBaseFiltering;
    }

    return itemsAfterBaseFiltering.filter((item) => item.type === activeTab);
  }, [activeTab, itemsAfterBaseFiltering]);

  const activeFiltersCount = statusFilters.length + languageFilters.length;
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((previous) => !previous);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters([]);
    setLanguageFilters([]);
  }, []);

  const handleSortFieldChange = useCallback((field: SortFieldValue) => {
    if (field === 'date') {
      setSortValue((previous) => {
        const nextValue = previous.startsWith('date') ? previous : 'date_desc';
        localStorage.setItem(SORT_STORAGE_KEY, nextValue);
        return nextValue;
      });
      return;
    }

    setSortValue((previous) => {
      const nextValue = previous.startsWith('name') ? previous : 'name_asc';
      localStorage.setItem(SORT_STORAGE_KEY, nextValue);
      return nextValue;
    });
  }, []);

  const handleSortValueChange = useCallback((nextValue: FilesSortValue) => {
    setSortValue(nextValue);
    localStorage.setItem(SORT_STORAGE_KEY, nextValue);
  }, []);

  const filterConfigs = useMemo(
    () =>
      PUBLICATIONS_FILTERS.map((filter) => ({
        id: filter.id,
        label: filter.label,
        options: filter.options,
        value: filter.id === 'status' ? statusFilters : languageFilters,
        hideClearAction: true,
        menuMinWidth: filter.menuMinWidth,
        onChange: filter.id === 'status' ? setStatusFilters : setLanguageFilters
      })),
    [languageFilters, statusFilters]
  );

  const toolbarProps = useMemo<PublicationsFilteringToolbarProps>(
    () => ({
      search: { search, setSearch, options: titleOptions },
      filters: filterConfigs,
      isFiltersOpen,
      onToggleFilters: toggleFilters,
      activeFiltersCount,
      onClearFilters: clearFilters
    }),
    [activeFiltersCount, clearFilters, filterConfigs, isFiltersOpen, search, titleOptions, toggleFilters]
  );

  const sortProps = useMemo<PublicationsFilteringSortProps>(
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
    filteredItems,
    toolbarProps,
    sortProps
  };
}