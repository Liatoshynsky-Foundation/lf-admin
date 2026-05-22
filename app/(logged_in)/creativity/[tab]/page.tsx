import { Box } from '@mui/material';
import { notFound } from 'next/navigation';

import { WorksPageContent } from '../WorksPageContent';
import { WORKS_TABS, type WorksTabValue } from '~/constants/creativity';

type WorksTabPageProps = Readonly<{
  params: Promise<{
    tab: string;
  }>;
}>;

const enabledTabs = new Set(WORKS_TABS.filter((tab) => !tab.disabled).map((tab) => tab.value));

export default async function WorksTabPage({ params }: WorksTabPageProps) {
  const { tab } = await params;

  if (!enabledTabs.has(tab as WorksTabValue)) {
    notFound();
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        px: { xs: '16px', lg: '24px', xl: '32px' },
        py: '32px'
      }}
    >
      <WorksPageContent activeTab={tab as WorksTabValue} />
    </Box>
  );
}
