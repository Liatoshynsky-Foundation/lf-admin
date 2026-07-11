import { Box } from '@mui/material';
import { notFound } from 'next/navigation';

import { ArchivePageContent } from '../(componets)/ArchivePageContent';
import { styles } from '../page.styles';
import { ARCHIVE_TABS, type ArchiveTabValue } from '~/constants/archive';

interface ArchiveTabPageProps {
  params: Promise<{ tab: string }>
}

const enabledTabs = new Set(ARCHIVE_TABS.map((tab) => tab.value));

export default async function ArchiveTabPage({ params }: Readonly<ArchiveTabPageProps>) {
  const { tab } = await params;

  if (!enabledTabs.has(tab)) {
    notFound();
  }

  return (
    <Box sx={styles.pageContainer}>
      <ArchivePageContent activeTab={tab as ArchiveTabValue} />
    </Box>
  );
}
