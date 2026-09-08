'use client';

import toast from 'react-hot-toast';

import { FoundationTeamContent } from './FoundationTeamContent';
import { FoundationTeamErrors } from '~/constants/errors';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { proseToHeaderText } from '~/lib/utils/prose';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { useStore } from '~/store';
import { ProseDoc } from '~/types/common';
import { FoundationFoundersBlock } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';

export default function FoundationTeamPage() {
  const setShowValidationErrors = useStore((state) => state.setShowValidationErrors);

  const validateBeforeSave = () => {
    const blocks = useStore.getState().blocks[PAGE_IDS.ABOUT_US];
    const membersBlock = blocks?.[BLOCK_IDS.FOUNDATION_FOUNDERS] as FoundationFoundersBlock | undefined;
    const members = membersBlock?.members || [];

    for (const member of members) {
      const isNameUaEmpty = !proseToHeaderText(member.name?.uk as ProseDoc);
      const isNameEnEmpty = !proseToHeaderText(member.name?.en as ProseDoc);
      const isDescUaEmpty = !proseToHeaderText(member.description?.uk as ProseDoc);
      const isDescEnEmpty = !proseToHeaderText(member.description?.en as ProseDoc);
      const isAltUaEmpty = !proseToHeaderText(member.photo?.alt?.uk as ProseDoc);
      const isAltEnEmpty = !proseToHeaderText(member.photo?.alt?.en as ProseDoc);

      if (isNameUaEmpty || isNameEnEmpty || isDescUaEmpty || isDescEnEmpty || isAltUaEmpty || isAltEnEmpty) {
        setShowValidationErrors(true);
        if (isNameUaEmpty || isDescUaEmpty || isAltUaEmpty) {
          toast.error(FoundationTeamErrors.MISSING_MEMBER_UK);
        } else if (isNameEnEmpty || isDescEnEmpty || isAltEnEmpty) {
          toast.error(FoundationTeamErrors.MISSING_MEMBER_EN);
        }
        return false;
      }
    }

    setShowValidationErrors(false);
    return true;
  };

  return (
    <EditablePageLayout
      pageSlug={PAGE_IDS.ABOUT_US}
      headerTitle="Команда Фундації"
      variant="simple-layout"
      validateBeforeSave={validateBeforeSave}
      blockIdToPublish={BLOCK_IDS.FOUNDATION_FOUNDERS}
      backHref="/about-us"
    >
      <FoundationTeamContent />
    </EditablePageLayout>
  );
}
