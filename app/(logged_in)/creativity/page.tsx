import { Box } from '@mui/material';

import { WorksPageContent } from './WorksPageContent';

export default function CreativityPage() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        px: { xs: '16px', lg: '24px', xl: '32px' },
        py: '32px'
      }}
    >
      <WorksPageContent activeTab="all" />
    </Box>
  );
}
