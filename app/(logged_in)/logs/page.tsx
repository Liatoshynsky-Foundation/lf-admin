import { Box } from '@mui/material';

import LogsPageClient from './LogsPageClient';
import { styles } from './page.styles';
export default function LogsPage() {
  return (
    <Box sx={styles.logsPageWrapper}>
      <LogsPageClient />
    </Box>
  );
}
