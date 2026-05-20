import { Box } from '@mui/material';

import LogsPageClient from './LogsPageClient';

export default function LogsPage() {
  return (
    <Box sx={{ width: '100%', p: '32px' }}>
      <LogsPageClient />
    </Box>
  );
}
