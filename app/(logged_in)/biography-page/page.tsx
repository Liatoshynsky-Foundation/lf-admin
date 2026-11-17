'use client';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { EmptyState } from '~/shared/components/empty-state';

export default function BiographyPageContent() {
  return (
    <EditablePageLayout pageSlug={PAGE_IDS.BIOGRAPHY} headerTitle="Біографія">
      <EmptyState
        title="Редактор біографії в розробці"
        description="Блоки сторінки «Біографія» будуть додані згодом."
        dataTestId="biography-editor-placeholder"
      />
    </EditablePageLayout>
  );
}
