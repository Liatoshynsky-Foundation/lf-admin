'use client';
import { Box } from '@mui/material';

import { useArchiveFiltering } from '../(hooks)/useArchiveFiltering';
import { ARCHIVE_FONDS_MOCK_DATA } from '../(temp)/archive.mock';
import { FondsTable } from './archive-fonds-table/ArchiveFondsTable';
import { ArchiveCreateAction } from './ArchiveCreateAction';
import { styles } from './ArchivePageContent.styles';
import { ARCHIVE_PAGE_TITLE, ARCHIVE_STATUS_FILTER_OPTIONS, ARCHIVE_TABS, type ArchiveTabValue } from '~/constants/archive';
import { normalizeSearch } from '~/lib/utils/normalizeSearch';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { SearchStatusToolbar } from '~/shared/components/search-status-toolbar/SearchStatusToolbar';

interface ArchivePageContentProps { activeTab: ArchiveTabValue }

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  const { searchProps, statusFilterProps } = useArchiveFiltering();

  const searchValue = searchProps.search;
  const normalizedSearch = normalizeSearch(searchValue);
  const filterValues = statusFilterProps.value || [];

  const visibleFonds = ARCHIVE_FONDS_MOCK_DATA.filter((fond) => {
    const matchesStatus = filterValues.includes(ARCHIVE_STATUS_FILTER_OPTIONS[0].value) ? true : filterValues.includes(fond.status);

    const normalizedFondName = normalizeSearch(fond.name);
    const matchesName = normalizedFondName.includes(normalizedSearch);

    return matchesStatus && matchesName;
  });

  const ascSortedVisibleFonds = visibleFonds.toSorted((a, b) => Number(a.fondNumber) - Number(b.fondNumber));

  const hasActiveCriteria = Boolean(searchProps.search) || !filterValues.includes(ARCHIVE_STATUS_FILTER_OPTIONS[0].value);

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader
        title={ARCHIVE_PAGE_TITLE}
        activeTab={activeTab}
        tabs={ARCHIVE_TABS}
        action={<ArchiveCreateAction />}
      />
      <SearchStatusToolbar dataTestId='archive-control-panel' searchProps={searchProps} statusFilterProps={statusFilterProps} />

      <FondsTable fonds={ascSortedVisibleFonds} hasActiveCriteria={hasActiveCriteria} />
    </Box >
  );
};