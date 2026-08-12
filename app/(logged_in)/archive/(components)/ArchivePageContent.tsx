'use client';
import { Box } from '@mui/material';

import { useArchiveFiltering } from '../(hooks)/useArchiveFiltering';
import { FondsTable } from './archive-fonds-table/ArchiveFondsTable';
import { ArchiveCreateAction } from './ArchiveCreateAction';
import { styles } from './ArchivePageContent.styles';
import {
  ARCHIVE_PAGE_TITLE,
  ARCHIVE_TABS,
  type ArchiveTabValue
} from '~/constants/archive';
import { FONDS_EMPTY_STATE_DESCRIPTION, FONDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION, FONDS_EMPTY_STATE_NO_RESULTS_TITLE, FONDS_EMPTY_STATE_TITLE, FONDS_ERROR_STATE_DESCRIPTION, FONDS_ERROR_STATE_TITLE, FONDS_LOADING_STATE_DESCRIPTION, FONDS_LOADING_STATE_TITLE } from '~/constants/fond';
import { EmptyState } from '~/shared/components/empty-state';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { SearchStatusToolbar } from '~/shared/components/search-status-toolbar/SearchStatusToolbar';
import { useAllFonds } from '~/shared/hooks/use-fonds/useFonds';
import { FondStatus } from '~/types/graphql/generated/graphql';

interface ArchivePageContentProps {
  activeTab: ArchiveTabValue;
}

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  const { searchProps, statusFilterProps } = useArchiveFiltering();

  const searchValue = searchProps.search;
  const filterValues = statusFilterProps.value;
  const isAllStatus = filterValues.length === 0;

  const { fonds, loading, error } = useAllFonds({
    search: searchValue || undefined,
    statuses: isAllStatus ? undefined : (filterValues as FondStatus[])
  });

  const ascSortedVisibleFonds = [...fonds].sort((a, b) => Number(a.fondNumber) - Number(b.fondNumber));

  const hasActiveSearch = Boolean(searchValue);
  const hasActiveStatusFilter = !isAllStatus;
  const hasActiveCriteria = hasActiveSearch || hasActiveStatusFilter;

  const content = (() => {
    if (loading) {
      return (
        <EmptyState 
          title={FONDS_LOADING_STATE_TITLE}
          description={FONDS_LOADING_STATE_DESCRIPTION} 
        />
      );
    }

    if (error) {
      return (
        <EmptyState 
          title={FONDS_ERROR_STATE_TITLE}
          description={FONDS_ERROR_STATE_DESCRIPTION} 
        />
      );
    }

    if (ascSortedVisibleFonds.length > 0) {
      return (
        <FondsTable
          fonds={ascSortedVisibleFonds}
          hasActiveSearch={hasActiveSearch}
          hasActiveStatusFilter={hasActiveStatusFilter}
        />
      );
    }

    if (hasActiveCriteria) {
      return (
        <EmptyState 
          title={FONDS_EMPTY_STATE_NO_RESULTS_TITLE}
          description={FONDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION} 
        />
      );
    }

    return (
      <EmptyState 
        title={FONDS_EMPTY_STATE_TITLE}
        description={FONDS_EMPTY_STATE_DESCRIPTION} 
      />
    );
  })();

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader
        title={ARCHIVE_PAGE_TITLE}
        activeTab={activeTab}
        tabs={ARCHIVE_TABS}
        action={<ArchiveCreateAction />}
      />
      <SearchStatusToolbar
        dataTestId="archive-control-panel"
        searchProps={searchProps}
        statusFilterProps={statusFilterProps}
      />

      {content}
    </Box>
  );
};
