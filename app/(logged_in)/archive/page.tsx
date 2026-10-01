import { Box } from '@mui/material';
import { Suspense } from 'react';

import { ArchivePageContent } from './(components)/ArchivePageContent';
import { styles } from './page.styles';

export default function ArchivePage() {
  return (
    <Box sx={styles.pageContainer}>
      <Suspense>
        <ArchivePageContent activeTab='all' />
      </Suspense>
    </Box>
  );
}
