'use client';
import { Box } from '@mui/material';

import { ArchiveCreateAction } from './ArchiveCreateAction';
import { styles } from './ArchivePageContent.styles';
import { useWorksFiltering } from '~/(logged_in)/creativity/useWorksFiltering';
import { ARCHIVE_PAGE_TITLE, ARCHIVE_TABS, type ArchiveTabValue } from '~/constants/archive';
import { FilteringToolbar } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';

interface ArchivePageContentProps { activeTab: ArchiveTabValue }

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  const { toolbarProps } = useWorksFiltering();

  return (
    <Box sx={styles.pageContainer}>
      <PageHeader 
        title={ARCHIVE_PAGE_TITLE} 
        activeTab={activeTab}
        tabs={ARCHIVE_TABS}
        action={<ArchiveCreateAction />} 
      />
      <FilteringToolbar
        {...toolbarProps}
        dataTestId="archive-control-panel"
        filtersButtonLabel="Фільтри"
        clearFiltersTooltip="Скинути всі налаштування"
      />
    </Box >
  );
};