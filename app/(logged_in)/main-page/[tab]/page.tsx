import { Box } from '@mui/material';
import { notFound } from 'next/navigation';

import { MainPagesContent } from '../MainPageContent';

const validTabs = new Set(['all', 'foundation']);

type MainPagesTabProps = Readonly<{
  params: Promise<{
    tab: string;
  }>;
}>;

export default async function MainPagesTabPage({ params }: MainPagesTabProps) {
  const { tab } = await params;

  if (!validTabs.has(tab)) {
    notFound();
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <MainPagesContent activeTab={tab} />
    </Box>
  );
}
