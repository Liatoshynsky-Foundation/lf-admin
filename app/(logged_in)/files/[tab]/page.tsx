import { Box } from '@mui/material';
import { notFound } from 'next/navigation';

import { FilesPageContent } from '../FilesPageContent';
import { FILE_TABS, type FilesTabValue } from '~/constants/files';

type FilesTabPageProps = Readonly<{
  params: Promise<{
    tab: string;
  }>;
}>;

const enabledTabs = new Set(
  FILE_TABS.filter((tab) => !tab.disabled).map((tab) => tab.value)
);

export default async function FilesTabPage({ params }: FilesTabPageProps) {
  const { tab } = await params;

  if (!enabledTabs.has(tab as FilesTabValue)) {
    notFound();
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <FilesPageContent activeTab={tab as FilesTabValue} />
    </Box>
  );
}