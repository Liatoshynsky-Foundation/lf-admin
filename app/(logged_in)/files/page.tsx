import { Box } from '@mui/material';

import { FilesPageContent } from './FilesPageContent';

export default function FilesPage() {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <FilesPageContent activeTab="all" />
    </Box>
  );
}
