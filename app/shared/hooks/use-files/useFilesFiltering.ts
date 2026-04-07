import { useCallback, useMemo, useState } from 'react';

import { FORMAT_FILTER_OPTIONS } from '~/constants/file-formats';
import {
  type FilesSortValue,
  type FilesTabValue,
  SORT_FIELD_OPTIONS,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  type SortFieldValue,
  USAGE_FILTER_OPTIONS
} from '~/constants/files';
import type { FilesCardsLayoutItem } from '~/shared/components/files-cards-layout';
import type { FilteringToolbarFilterConfig, FilteringToolbarProps , SortSelectProps } from '~/shared/components/filtering-toolbar';
import { normalizeSearch } from '~/shared/utils/normalizeSearch';

type FilesFilteringUsageLink = Readonly<{
  label: string;
}>;

export type UseFilesFilteringItem = Readonly<{
  id: string;
  name: string;
  type: FilesCardsLayoutItem['type'];
  dateAdded: string;
  createdAtRaw?: string;
  format?: string;
  isStarred?: boolean;
  usage: ReadonlyArray<FilesFilteringUsageLink>;
}>;

export type FilesFilteringToolbarProps = Pick<
  FilteringToolbarProps,
  'search' | 'filters' | 'isFiltersOpen' | 'onToggleFilters' | 'activeFiltersCount' | 'onClearFilters'
>;

export type FilesFilteringSortProps = Omit<
  SortSelectProps<SortFieldValue, FilesSortValue>,
  'minWidth' | 'dataTestId'
>;

export type UseFilesFilteringResult<Item extends UseFilesFilteringItem> = Readonly<{
  filteredFiles: Item[];
  toolbarProps: FilesFilteringToolbarProps;
  sortProps: FilesFilteringSortProps;
}>;

const normalizeFormatFilterValue = (value: string): string => {
  if (value === 'jpeg') {
    return 'jpg';
  }

  if (value === 'svg+xml') {
    return 'svg';
  }

  if (value === 'msword') {
    return 'doc';
  }

  if (value === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx';
  }

  if (value === 'vnd.ms-excel') {
    return 'xls';
  }

  if (value === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'xlsx';
  }

  if (value === 'x-zip-compressed') {
    return 'zip';
  }

  return value;
};

const DOCS_FORMAT_VALUES = new Set<string>(['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx']);

const getUsageFilterValues = (usageLinks: ReadonlyArray<FilesFilteringUsageLink>): string[] => {
  if (!usageLinks.length) {
    return ['unused'];
  }

  const categories = new Set<string>();

  usageLinks.forEach((usageLink) => {
    const normalizedLabel = normalizeSearch(usageLink.label);

    if (/новин|медіа|news|media/.test(normalizedLabel)) {
      categories.add('news_media');
      return;
    }

    if (/поді|event/.test(normalizedLabel)) {
      categories.add('events');
      return;
    }

    if (/творч|creative/.test(normalizedLabel)) {
      categories.add('creativity');
      return;
    }

    if (/файл|files/.test(normalizedLabel)) {
      categories.add('files');
      return;
    }

    if (/науков|scientific|research/.test(normalizedLabel)) {
      categories.add('research');
      return;
    }

    categories.add('main_pages');
  });

  return Array.from(categories);
};

export function useFilesFiltering<Item extends UseFilesFilteringItem>(
  allFiles: Item[],
  activeTab: FilesTabValue = 'all'
): UseFilesFilteringResult<Item> {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formatFilters, setFormatFilters] = useState<string[]>([]);
  const [usageFilters, setUsageFilters] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<FilesSortValue>(() => {
    if (globalThis.window === undefined) {
      return 'date_desc';
    }

    const saved = localStorage.getItem('files_sort');
    return (SORT_OPTIONS.some((option) => option.value === saved) ? saved : 'date_desc') as FilesSortValue;
  });

  const titleOptions = useMemo(() => {
    return Array.from(new Map(allFiles.map((file) => [file.id, { id: file.id, title: file.name }])).values());
  }, [allFiles]);

  const filesAfterBaseFiltering = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    const filtered = allFiles.filter((file) => {
      const matchesSearch = !normalizedSearch || file.name.toLowerCase().includes(normalizedSearch);
      const normalizedFileFormat = normalizeFormatFilterValue(file.format?.toLowerCase() ?? '');
      const matchesFormat =
        !formatFilters.length ||
        formatFilters.some((formatFilter) => normalizeFormatFilterValue(formatFilter) === normalizedFileFormat);
      const fileUsageFilterValues = getUsageFilterValues(file.usage);
      const matchesUsage =
        !usageFilters.length || usageFilters.some((usageFilter) => fileUsageFilterValues.includes(usageFilter));

      return matchesSearch && matchesFormat && matchesUsage;
    });

    return [...filtered].sort((left, right) => {
      if (sortValue === 'name_asc') {
        return left.name.localeCompare(right.name, 'uk');
      }

      if (sortValue === 'name_desc') {
        return right.name.localeCompare(left.name, 'uk');
      }

      const leftDate = new Date(left.createdAtRaw ?? left.dateAdded).getTime();
      const rightDate = new Date(right.createdAtRaw ?? right.dateAdded).getTime();

      if (sortValue === 'date_asc') {
        return leftDate - rightDate;
      }

      return rightDate - leftDate;
    });
  }, [allFiles, formatFilters, search, sortValue, usageFilters]);

  const filteredFiles = useMemo(() => {
    if (activeTab === 'all') {
      return filesAfterBaseFiltering;
    }

    if (activeTab === 'favorites') {
      return filesAfterBaseFiltering.filter((file) => file.isStarred);
    }

    if (activeTab === 'docs') {
      return filesAfterBaseFiltering.filter((file) =>
        DOCS_FORMAT_VALUES.has(normalizeFormatFilterValue(file.format?.toLowerCase() ?? ''))
      );
    }

    return filesAfterBaseFiltering.filter((file) => file.type === activeTab);
  }, [activeTab, filesAfterBaseFiltering]);

  const activeFiltersCount = formatFilters.length + usageFilters.length;
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((previous) => !previous);
  }, []);

  const clearFilters = useCallback(() => {
    setFormatFilters([]);
    setUsageFilters([]);
  }, []);

  const handleSortFieldChange = useCallback((field: SortFieldValue) => {
    if (field === 'date') {
      setSortValue((previous) => {
        const next = previous.startsWith('date') ? previous : 'date_desc';
        localStorage.setItem('files_sort', next);
        return next;
      });
      return;
    }

    setSortValue((previous) => {
      const next = previous.startsWith('name') ? previous : 'name_asc';
      localStorage.setItem('files_sort', next);
      return next;
    });
  }, []);

  const handleSortValueChange = useCallback((nextValue: FilesSortValue) => {
    setSortValue(nextValue);
    localStorage.setItem('files_sort', nextValue);
  }, []);

  const filterConfigs = useMemo<FilteringToolbarFilterConfig[]>(
    () => [
      {
        id: 'format',
        label: 'Формат',
        options: FORMAT_FILTER_OPTIONS,
        value: formatFilters,
        hideClearAction: true,
        menuMinWidth: 116,
        onChange: setFormatFilters
      },
      {
        id: 'usage',
        label: 'Використання',
        options: USAGE_FILTER_OPTIONS,
        value: usageFilters,
        hideClearAction: true,
        menuMinWidth: 190,
        onChange: setUsageFilters
      }
    ],
    [formatFilters, usageFilters]
  );

  const toolbarProps = useMemo<FilesFilteringToolbarProps>(
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

  const sortProps = useMemo<FilesFilteringSortProps>(
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
    filteredFiles,
    toolbarProps,
    sortProps
  };
}