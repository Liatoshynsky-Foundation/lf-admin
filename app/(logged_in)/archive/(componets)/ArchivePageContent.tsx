import { Box } from '@mui/material';

import { FilteringToolbar } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';

interface ArchivePageContentProps { activeTab: string }

export const ArchivePageContent = ({ activeTab }: ArchivePageContentProps) => {
  return (
    <Box>
      <PageHeader title="Archive" activeTab={activeTab} />

      <FilteringToolbar
        dataTestId="archive-control-panel"
      />
    </Box>
  );
};