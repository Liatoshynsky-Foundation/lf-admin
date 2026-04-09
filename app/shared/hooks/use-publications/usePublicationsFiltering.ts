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
  type PublicationsLanguageValue,
  type PublicationsStatusValue
} from '~/constants/publications';
import type { FilteringToolbarProps, SortSelectProps } from '~/shared/components/filtering-toolbar';
import {
  ContentLanguage,
  type MediaMentionsFiltersInput,
  MediaStatus,
  type NewsFiltersInput,
  NewsSortBy,
  NewsStatus,
  SortOrder
} from '~/types/graphql/generated/graphql';

const SORT_STORAGE_KEY = 'publications_sort';

export type PublicationsFilteringToolbarProps = Pick<
  FilteringToolbarProps,
  'search' | 'filters' | 'isFiltersOpen' | 'onToggleFilters' | 'activeFiltersCount' | 'onClearFilters'
>;

export type PublicationsFilteringSortProps = Omit<
  SortSelectProps<SortFieldValue, FilesSortValue>,
  'minWidth' | 'dataTestId'
>;

export type PublicationsRequestFilters = Readonly<{
  news: NewsFiltersInput;
  media: MediaMentionsFiltersInput;
}>;

const mapPublicationStatusToNewsStatus = (status: PublicationsStatusValue): NewsStatus => {
  if (status === 'published_with_draft') {
    return NewsStatus.Editing;
  }

  if (status === 'published') {
    return NewsStatus.Published;
  }

  return NewsStatus.Draft;
};

const mapPublicationStatusToMediaStatus = (status: PublicationsStatusValue): MediaStatus => {
  if (status === 'published_with_draft') {
    return MediaStatus.Editing;
  }

  if (status === 'published') {
    return MediaStatus.Published;
  }

  return MediaStatus.Draft;
};

const mapPublicationLanguageToApiLanguage = (language: PublicationsLanguageValue): ContentLanguage => {
  if (language === 'bilingual') {
    return ContentLanguage.Bilingual;
  }

  if (language === 'en') {
    return ContentLanguage.En;
  }

  return ContentLanguage.Uk;
};

const getNewsSortOptions = (sortValue: FilesSortValue): NonNullable<NewsFiltersInput['sort']> => {
  if (sortValue === 'name_asc') {
    return [
      { field: NewsSortBy.AdminTitle, order: SortOrder.Asc },
      { field: NewsSortBy.CreatedAt, order: SortOrder.Desc }
    ];
  }

  if (sortValue === 'name_desc') {
    return [
      { field: NewsSortBy.AdminTitle, order: SortOrder.Desc },
      { field: NewsSortBy.CreatedAt, order: SortOrder.Desc }
    ];
  }

  if (sortValue === 'date_asc') {
    return [{ field: NewsSortBy.CreatedAt, order: SortOrder.Asc }];
  }

  return [{ field: NewsSortBy.CreatedAt, order: SortOrder.Desc }];
};

const getMediaSortOptions = (sortValue: FilesSortValue): NonNullable<MediaMentionsFiltersInput['sort']> => {
  if (sortValue === 'name_asc') {
    return [
      { field: 'adminTitle', order: SortOrder.Asc },
      { field: 'createdAt', order: SortOrder.Desc }
    ];
  }

  if (sortValue === 'name_desc') {
    return [
      { field: 'adminTitle', order: SortOrder.Desc },
      { field: 'createdAt', order: SortOrder.Desc }
    ];
  }

  if (sortValue === 'date_asc') {
    return [{ field: 'createdAt', order: SortOrder.Asc }];
  }

  return [{ field: 'createdAt', order: SortOrder.Desc }];
};

const getInitialSortValue = (): FilesSortValue => {
  if (globalThis.window === undefined) {
    return 'date_desc';
  }

  const saved = localStorage.getItem(SORT_STORAGE_KEY);

  return (SORT_OPTIONS.some((option) => option.value === saved) ? saved : 'date_desc') as FilesSortValue;
};

export function usePublicationsFiltering(): Readonly<{
  requestFilters: PublicationsRequestFilters;
  sortValue: FilesSortValue;
  toolbarProps: PublicationsFilteringToolbarProps;
  sortProps: PublicationsFilteringSortProps;
}> {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<PublicationsStatusValue[]>([]);
  const [languageFilters, setLanguageFilters] = useState<PublicationsLanguageValue[]>([]);
  const [sortValue, setSortValue] = useState<FilesSortValue>(getInitialSortValue);

  const activeFiltersCount = statusFilters.length + languageFilters.length;
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';
  const normalizedSearch = search.trim();
  const requestFilters = useMemo<PublicationsRequestFilters>(
    () => ({
      news: {
        search: normalizedSearch || undefined,
        languages: languageFilters.length ? languageFilters.map(mapPublicationLanguageToApiLanguage) : undefined,
        statuses: statusFilters.length ? statusFilters.map(mapPublicationStatusToNewsStatus) : undefined,
        sort: getNewsSortOptions(sortValue)
      },
      media: {
        search: normalizedSearch || undefined,
        languages: languageFilters.length ? languageFilters.map(mapPublicationLanguageToApiLanguage) : undefined,
        statuses: statusFilters.length ? statusFilters.map(mapPublicationStatusToMediaStatus) : undefined,
        sort: getMediaSortOptions(sortValue)
      }
    }),
    [languageFilters, normalizedSearch, sortValue, statusFilters]
  );

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
        onChange:
          filter.id === 'status'
            ? (value: string[]) => setStatusFilters(value as PublicationsStatusValue[])
            : (value: string[]) => setLanguageFilters(value as PublicationsLanguageValue[])
      })),
    [languageFilters, statusFilters]
  );

  const toolbarProps = useMemo<PublicationsFilteringToolbarProps>(
    () => ({
      search: { search, setSearch, options: [] },
      filters: filterConfigs,
      isFiltersOpen,
      onToggleFilters: toggleFilters,
      activeFiltersCount,
      onClearFilters: clearFilters
    }),
    [activeFiltersCount, clearFilters, filterConfigs, isFiltersOpen, search, toggleFilters]
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
    requestFilters,
    sortValue,
    toolbarProps,
    sortProps
  };
}