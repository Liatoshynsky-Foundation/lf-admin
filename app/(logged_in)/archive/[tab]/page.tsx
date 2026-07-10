import { Box } from '@mui/material';

import { ArchivePageContent } from '../(componets)/ArchivePageContent';

interface ArchiveTabPageProps {
    params: Promise<{ tab: string }>
}

export default async function ArchiveTabPage({ params }: Readonly<ArchiveTabPageProps>) {
  const { tab } = await params;

  return (
    <Box>
      <ArchivePageContent activeTab={tab} />
    </Box>
  );
}
