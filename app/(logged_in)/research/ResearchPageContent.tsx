'use client';

import { Box } from '@mui/material';

import { RESEARCH_WORKS_MOCK_DATA } from './research.mock';
import { ResearchContent } from './ResearchContent';
import { ResearchCreateAction } from './ResearchCreateAction';
import { styles } from './ResearchPageContent.styles';
import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { RESEARCH_PAGE_TITLE } from '~/constants/research';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { FilterSelect } from '~/shared/components/selector/FilterSelect';
import { normalizeSearch } from '~/utils/normalizeSearch';

export function ResearchPageContent() {
  const { sortValue, selectedFilters, toolbarProps, sortProps, statusFilterProps, activeFiltersCount } =
    useResearchWorksFiltering();

  const searchValue = (toolbarProps.search?.search ?? '').trim().toLowerCase();
  const normalizedSearch = normalizeSearch(searchValue);

  const matchesSearch = (text: string) =>
    !normalizedSearch || normalizeSearch(text.toLowerCase()).includes(normalizedSearch);

  const filtered = RESEARCH_WORKS_MOCK_DATA.filter((work) => {
    const statusMatches = selectedFilters.status.length === 0 || selectedFilters.status.includes(work.status);
    const searchMatches =
      matchesSearch(work.author) || matchesSearch(work.bibliographicDescription) || matchesSearch(work.keywords);

    return statusMatches && searchMatches;
  });

  const visibleWorks = [...filtered].sort((left, right) => {
    if (sortValue === 'name_asc') {
      return left.author.localeCompare(right.author, 'uk');
    }
    if (sortValue === 'name_desc') {
      return right.author.localeCompare(left.author, 'uk');
    }

    const leftDate = new Date(left.updatedAt).getTime();
    const rightDate = new Date(right.updatedAt).getTime();

    return sortValue === 'date_asc' ? leftDate - rightDate : rightDate - leftDate;
  });

  const hasActiveCriteria = Boolean(searchValue) || Boolean(activeFiltersCount);

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader title={RESEARCH_PAGE_TITLE} action={<ResearchCreateAction />} />

      <FilteringToolbar
        search={toolbarProps.search}
        dataTestId="research-control-panel"
        rightSlot={<FilterSelect {...statusFilterProps} />}
        bottomTrailingContent={<SortSelect {...sortProps} minWidth={208} dataTestId="research-sort-select" />}
      />

      <ResearchContent visibleWorks={visibleWorks} hasActiveCriteria={hasActiveCriteria} />
    </Box>
  );
}
