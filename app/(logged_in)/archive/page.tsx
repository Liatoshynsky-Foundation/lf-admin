import { Box } from '@mui/material';

import { ArchivePageContent } from './(componets)/ArchivePageContent';
import { styles } from './page.styles';

export default async function ArchivePage() {
  return (
    <Box sx={styles.pageContainer}>
      <ArchivePageContent activeTab='all' />
    </Box>
  );
}
