import { Box } from '@mui/material';

import { WorksPageContent } from './WorksPageContent';

export default function CreativityPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <WorksPageContent activeTab="all" />
    </Box>
  );
}
