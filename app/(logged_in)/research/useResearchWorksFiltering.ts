'use client';

import { useMemo, useState } from 'react';

import { RESEARCH_STATUS_OPTIONS } from '~/constants/research';
import type { FilteringToolbarProps } from '~/shared/components/filtering-toolbar';
import type { FilterSelectProps } from '~/shared/components/selector/FilterSelect';
import { useDebounce } from '~/shared/hooks/use-debounce/useDebounce';
import { toGqlResearchWorkStatus } from '~/shared/hooks/use-research-works/researchWorkMappers';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  type ResearchWorkFiltersInput,
  ResearchWorksSortBy,
  type ResearchWorksSortOptions,
  type ResearchWorkStatus as GqlResearchWorkStatus,
  SortOrder
} from '~/types/graphql/generated/graphql';
import type { ResearchWorkStatus } from '~/types/researchWork';

const isResearchStatusValue = (value: string): value is ResearchWorkStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

export const RESEARCH_WORKS_DEFAULT_SORT: ResearchWorksSortOptions[] = [
  { field: ResearchWorksSortBy.Author, order: SortOrder.Asc },
  { field: ResearchWorksSortBy.Year, order: SortOrder.Desc },
  { field: ResearchWorksSortBy.BibliographicDescription, order: SortOrder.Asc }
];

export type ResearchWorksFilteringToolbarProps = Pick<FilteringToolbarProps, 'search'>;

export type ResearchWorksStatusFilterProps = Omit<FilterSelectProps, 'value'> & {
  value: ResearchWorkStatus[];
};

export function useResearchWorksFiltering(): Readonly<{
  requestFilters: ResearchWorkFiltersInput;
  searchValue: string;
  selectedFilters: Readonly<{ status: readonly ResearchWorkStatus[] }>;
  toolbarProps: ResearchWorksFilteringToolbarProps;
  statusFilterProps: ResearchWorksStatusFilterProps;
  activeFiltersCount: number;
}> {
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<ResearchWorkStatus[]>([]);
  const debouncedSearch = useDebounce(search.trim(), 300);

  const activeFiltersCount = statusFilters.length;

  const requestFilters = useMemo<ResearchWorkFiltersInput>(() => {
    const statuses = statusFilters
      .map(toGqlResearchWorkStatus)
      .filter((status): status is GqlResearchWorkStatus => status !== null);

    return {
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(statuses.length > 0 ? { statuses } : {}),
      sort: RESEARCH_WORKS_DEFAULT_SORT
    };
  }, [debouncedSearch, statusFilters]);

  const toolbarProps = useMemo<ResearchWorksFilteringToolbarProps>(
    () => ({
      search: {
        search,
        setSearch,
        options: [],
        placeholder: 'Пошук'
      }
    }),
    [search]
  );

  const statusFilterProps = useMemo<ResearchWorksStatusFilterProps>(
    () => ({
      label: 'Статус',
      options: RESEARCH_STATUS_OPTIONS,
      value: statusFilters,
      maxSelections: 1,
      hideClearAction: true,
      persistLabel: true,
      menuAlign: 'right',
      onChange: (value) => setStatusFilters(value.filter(isResearchStatusValue))
    }),
    [statusFilters]
  );

  return {
    requestFilters,
    searchValue: debouncedSearch,
    selectedFilters: { status: statusFilters },
    toolbarProps,
    statusFilterProps,
    activeFiltersCount
  };
}
