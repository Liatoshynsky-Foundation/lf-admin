import { Box } from '@mui/material';

import { styles } from './page.styles';
import { ResearchPageContent } from './ResearchPageContent';

export default function ResearchPage() {
  return (
    <Box sx={styles.pageContainer}>
      <ResearchPageContent />
    </Box>
  );
}
