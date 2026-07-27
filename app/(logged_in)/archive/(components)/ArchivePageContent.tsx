'use client';
import { Box } from '@mui/material';

import { useArchiveFiltering } from '../(hooks)/useArchiveFiltering';
import { ARCHIVE_FONDS_MOCK_DATA } from '../(temp)/archive.mock';
import { FondsTable } from './archive-fonds-table/ArchiveFondsTable';
import { ArchiveCreateAction } from './ArchiveCreateAction';
import { styles } from './ArchivePageContent.styles';
import { ARCHIVE_PAGE_TITLE, ARCHIVE_TABS, type ArchiveTabValue } from '~/constants/archive';
import { normalizeSearch } from '~/lib/utils/normalizeSearch';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { SearchStatusToolbar } from '~/shared/components/search-status-toolbar/SearchStatusToolbar';

interface ArchivePageContentProps { activeTab: ArchiveTabValue }

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  const { searchProps, statusFilterProps } = useArchiveFiltering();

  const searchValue = searchProps.search;
  const normalizedSearch = normalizeSearch(searchValue);

  const visibleFonds = ARCHIVE_FONDS_MOCK_DATA.filter((fond) => {
    const isStatusSame = statusFilterProps.value?.includes('all') ? true : statusFilterProps.value?.includes(fond.status);

    const normalizedFondName = normalizeSearch(fond.name);
    const isNameSame = normalizedFondName.includes(normalizedSearch);

    if (isStatusSame && isNameSame) {
      return fond;
    }
    return false;
  });

  const ascSortedVisibleFonds = visibleFonds.toSorted((a, b) => Number(a.id) - Number(b.id));

  const hasActiveCriteria = Boolean(searchProps.search) || Boolean(statusFilterProps.value);

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