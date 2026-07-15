'use client';

import { Box } from '@mui/material';
import Link from 'next/link';

import { RESEARCH_WORKS_MOCK_DATA } from './research.mock';
import { styles } from './ResearchPageContent.styles';
import { ResearchTable } from './ResearchTable';
import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { normalizeSearch } from '~/utils/normalizeSearch';

export const RESEARCH_PAGE_TITLE = 'Дослідження та наукові праці';
export const RESEARCH_BASE_PATH = '/research';

const RESEARCH_EMPTY_STATE_TITLE = 'Наукових робіт ще немає.';
const RESEARCH_EMPTY_STATE_DESCRIPTION =
  'Наукових робіт ще немає. Натисніть «Додати роботу», щоб створити перший запис.';
const RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE = 'Нічого не знайдено';
const RESEARCH_EMPTY_STATE_NO_RESULTS_DESCRIPTION = 'Спробуйте змінити параметри пошуку або фільтрів.';

function ResearchCreateAction() {
  return (
    <Box
      component={Link}
      href={`${RESEARCH_BASE_PATH}/create`}
      sx={{ ...styles.createButton, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
    >
      + Додати роботу
    </Box>
  );
}

export function ResearchPageContent() {
  const { sortValue, selectedFilters, toolbarProps, sortProps } = useResearchWorksFiltering();

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

  const hasActiveCriteria = Boolean(searchValue) || Boolean(toolbarProps.activeFiltersCount);

  const content = (() => {
    if (visibleWorks.length === 0) {
      return (
        <EmptyState
          title={hasActiveCriteria ? RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE : RESEARCH_EMPTY_STATE_TITLE}
          description={
            hasActiveCriteria ? RESEARCH_EMPTY_STATE_NO_RESULTS_DESCRIPTION : RESEARCH_EMPTY_STATE_DESCRIPTION
          }
        />
      );
    }

    return <ResearchTable works={visibleWorks} />;
  })();

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader title={RESEARCH_PAGE_TITLE} action={<ResearchCreateAction />} />

      <FilteringToolbar
        {...toolbarProps}
        dataTestId="research-control-panel"
        bottomTrailingContent={<SortSelect {...sortProps} minWidth={208} dataTestId="research-sort-select" />}
      />

      {content}
    </Box>
  );
}
