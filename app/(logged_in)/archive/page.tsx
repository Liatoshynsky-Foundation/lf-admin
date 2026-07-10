import { Box } from '@mui/material';

import { ArchivePageContent } from './(componets)/ArchivePageContent';

export default async function ArchivePage() {
  return (
    <Box>
      <ArchivePageContent activeTab='all' />
    </Box>
  );
}
