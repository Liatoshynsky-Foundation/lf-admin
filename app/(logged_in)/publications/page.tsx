import { Box } from '@mui/material';

import { styles } from './page.styles';
import { PublicationsPageContent } from './PublicationsPageContent';

export default function PublicationsPage() {
  return (
    <Box sx={styles.pageContainer}>
      <PublicationsPageContent activeTab="all" />
    </Box>
  );
}
