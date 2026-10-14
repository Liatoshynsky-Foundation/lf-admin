'use client';

import toast from 'react-hot-toast';

import { FoundationTeamContent } from './FoundationTeamContent';
import { prepareTeamMembersForSave } from './foundationTeamMembers';
import { FoundationTeamErrors } from '~/constants/errors';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { hasMemberImage } from '~/lib/utils/hasMemberImage';
import { proseToText } from '~/lib/utils/prose';
import { scrollToFirstInvalidField } from '~/lib/utils/scrollToFirstInvalidField';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { useStore } from '~/store';
import { ProseDoc } from '~/types/common';
import { FoundationFoundersBlock } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';

export default function FoundationTeamPage() {
  const setShowValidationErrors = useStore((state) => state.setShowValidationErrors);

  const validateBeforeSave = () => {
    const { blocks, locale, setField } = useStore.getState();
    const membersBlock = blocks[PAGE_IDS.ABOUT_US]?.[BLOCK_IDS.FOUNDATION_FOUNDERS] as
      | FoundationFoundersBlock
      | undefined;
    const members = membersBlock?.members || [];

    const { members: preparedMembers, removedEmptyCount } = prepareTeamMembersForSave(members);
    setField(PAGE_IDS.ABOUT_US, BLOCK_IDS.FOUNDATION_FOUNDERS, 'members', preparedMembers);

    for (const member of preparedMembers) {
      if (!hasMemberImage(member.photo)) continue;

      const isAltEmpty = !proseToText(member.photo?.alt?.[locale] as ProseDoc)?.trim();

      if (isAltEmpty) {
        setShowValidationErrors(true);
        toast.error(FoundationTeamErrors.MISSING_ALT);
        scrollToFirstInvalidField();
        return false;
      }
    }

    if (removedEmptyCount > 0) {
      toast.success(FoundationTeamErrors.EMPTY_MEMBERS_REMOVED(removedEmptyCount));
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
