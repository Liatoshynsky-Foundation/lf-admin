import { Box } from '@mui/material';

import { MainPagesContent } from './MainPageContent';

export default async function MainPagesPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <MainPagesContent activeTab="foundation" />
    </Box>
  );
}
