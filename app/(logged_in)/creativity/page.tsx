import { Box } from '@mui/material';

import { styles } from './page.styles';
import { WorksPageContent } from './WorksPageContent';

export default function CreativityPage() {
  return (
    <Box sx={styles.pageContainer}>
      <WorksPageContent activeTab="all" />
    </Box>
  );
}
