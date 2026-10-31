import { PAGE_IDS } from '~/constants/pageBlocks';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { PublicationsIntro } from '~/shared/components/publications/publications-intro/PublicationsIntro';

export default function PublicationsPageContent() {
  return (
    <EditablePageLayout pageSlug={PAGE_IDS.PUBLICATIONS} headerTitle="Новини, події та медіа">
      <PublicationsIntro />
    </EditablePageLayout>
  );
}