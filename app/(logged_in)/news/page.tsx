import { Box, Typography } from '@mui/material';

import { ContentGrid } from '~/shared/components/content-grid';
import { ContentType } from '~/types/contentGrid';

export default function News() {
  return (
    <Box>
      <Box sx={{ p: 3, pb: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Новини та події
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Останні новини та оновлення
        </Typography>
      </Box>

      <ContentGrid contentType={ContentType.NEWS} limit={12} />
    </Box>
  );
}
