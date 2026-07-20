import { useCallback, useMemo, useState } from 'react';

import {
  PUBLICATIONS_FILTERS,
  type PublicationsStatusValue
} from '~/constants/publications';
import {
  type FilesSortValue,
  SORT_FIELD_OPTIONS,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  type SortFieldValue
} from '~/constants/sort';
import type { FilteringToolbarProps, SortSelectProps } from '~/shared/components/filtering-toolbar';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  EventFiltersInput,
  EventSortBy,
  EventStatus,
  type MediaMentionsFiltersInput,
  MediaMentionsSortBy,
  MediaStatus,
  type NewsFiltersInput,
  NewsSortBy,
  NewsStatus,
  SortOrder} from '~/types/graphql/generated/graphql';

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
  events: EventFiltersInput;
  media: MediaMentionsFiltersInput;
}>;

type PublicationStatusEnum<TStatus extends string> = Readonly<{
  Draft: TStatus;
  Published: TStatus;
  Editing: TStatus;
}>;

const PUBLICATION_STATUS_TO_ENUM_KEY = {
  [BaseContentStatuses.Draft]: 'Draft',
  [BaseContentStatuses.Published]: 'Published',
  [BaseContentStatuses.Editing]: 'Editing'
} as const satisfies Record<PublicationsStatusValue, keyof PublicationStatusEnum<string>>;

const mapPublicationStatus = <TStatus extends string>(
  status: PublicationsStatusValue,
  statusEnum: PublicationStatusEnum<TStatus>
): TStatus => {
  return statusEnum[PUBLICATION_STATUS_TO_ENUM_KEY[status]];
};


type BaseContentSortEnum<TField extends string> = Readonly<{
  AdminTitle: TField;
  CreatedAt: TField;
}>;

type BaseContentSortOption<TField extends string> = Readonly<{
  field: TField;
  order: SortOrder;
}>;

const getBaseContentSortOptions = <TField extends string>(
  sortValue: FilesSortValue,
  sortFields: BaseContentSortEnum<TField>
): BaseContentSortOption<TField>[] => {
  if (sortValue === 'name_asc') {
    return [
      { field: sortFields.AdminTitle, order: SortOrder.Asc },
      { field: sortFields.CreatedAt, order: SortOrder.Desc }
    ];
  }

  if (sortValue === 'name_desc') {
    return [
      { field: sortFields.AdminTitle, order: SortOrder.Desc },
      { field: sortFields.CreatedAt, order: SortOrder.Desc }
    ];
  }

  if (sortValue === 'date_asc') {
    return [{ field: sortFields.CreatedAt, order: SortOrder.Asc }];
  }

  return [{ field: sortFields.CreatedAt, order: SortOrder.Desc }];
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
  const [sortValue, setSortValue] = useState<FilesSortValue>(getInitialSortValue);

  const activeFiltersCount = statusFilters.length;
  const currentSortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];
  const currentSortField: SortFieldValue = sortValue.startsWith('date') ? 'date' : 'name';
  const normalizedSearch = search.trim();
  const requestFilters = useMemo<PublicationsRequestFilters>(
    () => ({
      news: {
        search: normalizedSearch || undefined,
        statuses: statusFilters.length ? statusFilters.map((status) => mapPublicationStatus(status, NewsStatus)) : undefined,
        sort: getBaseContentSortOptions(sortValue, NewsSortBy) as NonNullable<NewsFiltersInput['sort']>
      },
      events: {
        search: normalizedSearch || undefined,
        statuses: statusFilters.length ? statusFilters.map((status) => mapPublicationStatus(status, EventStatus)) : undefined,
        sort: getBaseContentSortOptions(sortValue, EventSortBy) as NonNullable<EventFiltersInput['sort']>
      },
      media: {
        search: normalizedSearch || undefined,
        statuses: statusFilters.length ? statusFilters.map((status) => mapPublicationStatus(status, MediaStatus)) : undefined,
        sort: getBaseContentSortOptions(sortValue, MediaMentionsSortBy) as NonNullable<MediaMentionsFiltersInput['sort']>
      }
    }),
    [normalizedSearch, sortValue, statusFilters]
  );

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((previous) => !previous);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilters([]);
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
        value: statusFilters,
        hideClearAction: true,
        menuMinWidth: filter.menuMinWidth,
        onChange:
          (value: string[]) => setStatusFilters(value as PublicationsStatusValue[])
      })),
    [statusFilters]
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
