'use client';
import { Box } from '@mui/material';

import { useArchiveFiltering } from '../(hooks)/useArchiveFiltering';
import { ArchiveCaseModal } from './ArchiveCaseModal';
import { ArchiveCreateAction } from './ArchiveCreateAction';
import { styles } from './ArchivePageContent.styles';
import { ARCHIVE_PAGE_TITLE, ARCHIVE_TABS, type ArchiveTabValue } from '~/constants/archive';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { SearchStatusToolbar } from '~/shared/components/search-status-toolbar/SearchStatusToolbar';

interface ArchivePageContentProps { activeTab: ArchiveTabValue }

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  const { searchProps, statusFilterProps } = useArchiveFiltering();

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader
        title={ARCHIVE_PAGE_TITLE}
        activeTab={activeTab}
        tabs={ARCHIVE_TABS}
        action={<ArchiveCreateAction />}
      />
      <SearchStatusToolbar dataTestId='archive-control-panel' searchProps={searchProps} statusFilterProps={statusFilterProps} />
      <ArchiveCaseModal isOpen setIsOpen={() => {}} />
    </Box >
  );
};