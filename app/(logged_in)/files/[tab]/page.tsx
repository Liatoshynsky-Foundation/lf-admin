import { notFound } from 'next/navigation';

import { FilesPageContent } from '../FilesPageContent';
import { FILE_TABS, type FilesTabValue } from '~/constants/files';

type FilesTabPageProps = Readonly<{
  params: {
    tab: string;
  };
}>;

const enabledTabs = new Set(
  FILE_TABS.filter((tab) => !tab.disabled).map((tab) => tab.value)
);

export default function FilesTabPage({ params }: FilesTabPageProps) {
  if (!enabledTabs.has(params.tab as FilesTabValue)) {
    notFound();
  }

  return <FilesPageContent activeTab={params.tab as FilesTabValue} />;
}