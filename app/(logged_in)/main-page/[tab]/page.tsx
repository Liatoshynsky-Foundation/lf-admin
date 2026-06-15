import { Box } from '@mui/material';
import { notFound } from 'next/navigation';

import { MainPagesContent, ValidTab } from '../MainPageContent';
import { styles } from './page.styles';


type MainPagesTabProps = Readonly<{
  params: Promise<{
    tab: string;
  }>;
}>;

const VALID_TABS = new Set(['all', 'foundation', 'other']);

function isValidTab(tab: string): tab is ValidTab {
  return VALID_TABS.has(tab);
}

export default async function MainPagesTabPage({ params }: MainPagesTabProps) {
  const { tab } = await params;

  if (!isValidTab(tab)) {
    notFound();
  }

  return (
    <Box sx={styles.mainPageTabContainer}>
      <MainPagesContent activeTab={tab} />
    </Box>
  );
}
