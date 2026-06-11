import { Box } from '@mui/material';
import { notFound } from 'next/navigation';

import { MainPagesContent } from '../MainPageContent';
import { styles } from './page.styles';

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
    <Box sx={styles.mainPageTabContainer}>
      <MainPagesContent activeTab={tab} />
    </Box>
  );
}
