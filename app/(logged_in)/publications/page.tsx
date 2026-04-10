import { Box } from '@mui/material';

import { PublicationsPageContent } from './PublicationsPageContent';

export default function PublicationsPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <PublicationsPageContent activeTab="all" />
    </Box>
  );
}
