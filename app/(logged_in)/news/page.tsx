import { Box } from '@mui/material';

import { ContentGrid } from '~/shared/components/content-grid';
import { ContentPageHeader } from '~/shared/components/content-page-header/ContentPageHeader';
import { ContentType } from '~/types/contentGrid';

export default function News() {
  return (
    <Box>
      <ContentPageHeader title="Новини та події" />

      <ContentGrid contentType={ContentType.NEWS} limit={12} />
    </Box>
  );
}
