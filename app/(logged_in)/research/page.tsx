import { Box } from '@mui/material';
import { Suspense } from 'react';

import { styles } from './page.styles';
import { ResearchPageContent } from './ResearchPageContent';

export default function ResearchPage() {
  return (
    <Box sx={styles.pageContainer}>
      <Suspense fallback={null}>
        <ResearchPageContent />
      </Suspense>
    </Box>
  );
}
