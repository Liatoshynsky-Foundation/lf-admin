import { useState } from 'react';

import { ARCHIVE_STATUS_FILTER_OPTIONS } from '~/constants/archive';
import { SearchProps } from '~/shared/components/search/Search';
import { FilterSelectProps } from '~/shared/components/selector/FilterSelect';


export const useArchiveFiltering = (): {
  activeStatusFilters: string[],
  searchProps: SearchProps,
  statusFilterProps: Omit<FilterSelectProps, 'value'> & { value: string[] }
} => {
  const [search, setSearch] = useState<string>('');
  const [statusFilters, setStatusFilters] = useState<string[]>([ARCHIVE_STATUS_FILTER_OPTIONS[0].value]);

  const activeStatusFilters = statusFilters;

  return {
    activeStatusFilters,
    searchProps: {
      search,
      setSearch,
      options: [],
      placeholder: 'Пошук за назвою фонду, назвою справи або змістом документів',
      maxWidth: '580px',
    },
    statusFilterProps: {
      label: 'Статус',
      options: ARCHIVE_STATUS_FILTER_OPTIONS,
      value: statusFilters,
      onChange: (value) => setStatusFilters(value),
      maxSelections: 1,
      hideClearAction: true,
    }
  };
};