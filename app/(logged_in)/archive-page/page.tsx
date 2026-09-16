'use client';

import toast from 'react-hot-toast';

import { isArchiveCaptionWithinLimit } from './validateArchiveCaption';
import { ARCHIVE_PAGE_VALIDATION_MESSAGES } from '~/constants/archive-page';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { PageCaption } from '~/shared/components/archive/page-caption/PageCaption';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { useStore } from '~/store';
import type { PageCaptionBlock } from '~/types/store/pages/archive';

export default function ArchivePageContent() {
  const validateBeforeSave = () => {
    const blocks = useStore.getState().blocks[PAGE_IDS.ARCHIVE];
    const caption = blocks?.[BLOCK_IDS.PAGE_CAPTION] as PageCaptionBlock | undefined;

    if (!isArchiveCaptionWithinLimit(caption)) {
      toast.error(ARCHIVE_PAGE_VALIDATION_MESSAGES.captionMaxLength);
      return false;
    }

    return true;
  };

  return (
    <EditablePageLayout
      pageSlug={PAGE_IDS.ARCHIVE}
      headerTitle="Архів"
      validateBeforeSave={validateBeforeSave}
    >
      <PageCaption />
    </EditablePageLayout>
  );
}
