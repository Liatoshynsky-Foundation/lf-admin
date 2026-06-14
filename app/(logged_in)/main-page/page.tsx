import { Box } from '@mui/material';

import { MainPagesContent } from './MainPageContent';
import { styles } from './page.styles';

export default async function MainPagesPage() {
  return (
    <Box sx={styles.mainPageWrapper}>
      <MainPagesContent activeTab="other" />
    </Box>
  );
}
