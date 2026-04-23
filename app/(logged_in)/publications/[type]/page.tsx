import { Box } from '@mui/material';
import { notFound } from 'next/navigation';

import { PublicationsPageContent } from '../PublicationsPageContent';
import { PUBLICATIONS_TABS, type PublicationsTabValue } from '~/constants/publications';

type PublicationsTypePageProps = Readonly<{
  params: Promise<{
    type: string;
  }>;
}>;

const enabledTabs = new Set(PUBLICATIONS_TABS.filter((tab) => !tab.disabled).map((tab) => tab.value));

export default async function PublicationsTypePage({ params }: PublicationsTypePageProps) {
  const { type } = await params;

  if (!enabledTabs.has(type as PublicationsTabValue)) {
    notFound();
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', p: '32px' }}>
      <PublicationsPageContent activeTab={type as PublicationsTabValue} />
    </Box>
  );
}
