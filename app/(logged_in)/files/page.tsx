import { Box } from '@mui/material';

import { FilesPageContent } from './FilesPageContent';
import { styles } from './page.styles';

export default function FilesPage() {
  return (
    <Box sx={styles.filePageWrapper}>
      <FilesPageContent activeTab="all" />
    </Box>
  );
}
