import { Box } from '@mui/material';

import { MainPagesContent } from './MainPageContent';

export default async function MainPagesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const activeTab = typeof resolvedParams.tab === 'string' ? resolvedParams.tab : 'foundation';

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <MainPagesContent activeTab={activeTab} />
    </Box>
  );
}
