import { useEffect, useState } from 'react';

import { ARCHIVE_SEARCH_PLACEHOLDER, ARCHIVE_STATUS_FILTER_OPTIONS } from '~/constants/archive';
import { SearchProps } from '~/shared/components/search/Search';
import { FilterSelectProps } from '~/shared/components/selector/FilterSelect';
import { useDebounce } from '~/shared/hooks/use-debounce/useDebounce';

export const useArchiveFiltering = (): {
  activeStatusFilters: string[];
  searchProps: SearchProps;
  appliedSearch: string;
  statusFilterProps: Omit<FilterSelectProps, 'value'> & { value: string[] };
} => {
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  useEffect(() => {
    setAppliedSearch(debouncedSearch);
  }, [debouncedSearch]);

  const commitSearch = () => {
    setAppliedSearch(search.trim());
  };

  return {
    appliedSearch,
    activeStatusFilters: statusFilters,
    searchProps: {
      search,
      setSearch,
      onEnter: commitSearch,
      options: [],
      placeholder: ARCHIVE_SEARCH_PLACEHOLDER,
      maxWidth: '580px'
    },
    statusFilterProps: {
      label: 'Статус',
      options: ARCHIVE_STATUS_FILTER_OPTIONS,
      value: statusFilters,
      onChange: (value) => setStatusFilters(value),
      maxSelections: 1,
      hideClearAction: true,
      menuAlign: 'right',
      persistLabel: true
    }
  };
};
