'use client';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { ResearchHeroSection } from '~/shared/components/research/hero-section/ResearchHeroSection';

export default function ResearchPageContent() {
  return (
    <EditablePageLayout pageSlug={PAGE_IDS.RESEARCH} headerTitle="Дослідження та наукові праці">
      <ResearchHeroSection />
    </EditablePageLayout>
  );
}
