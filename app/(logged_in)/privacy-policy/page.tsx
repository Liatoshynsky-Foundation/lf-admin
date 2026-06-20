'use client';
import { DragEndEvent } from '@dnd-kit/core';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { ContactUs } from '~/shared/components/privacy-policy/contact-us/ContactUs';
import { Cookies } from '~/shared/components/privacy-policy/cookies/Cookies';
import { DataRetention } from '~/shared/components/privacy-policy/data-retention/DataRetention';
import { DataUsage } from '~/shared/components/privacy-policy/data-usage/DataUsage';
import { DataWeCollect } from '~/shared/components/privacy-policy/data-we-collect/DataWeCollect';
import { GoogleAuth } from '~/shared/components/privacy-policy/google-auth/GoogleAuth';
import { IntroSection } from '~/shared/components/privacy-policy/intro-section/IntroSection';
import { NewsletterSubscription } from '~/shared/components/privacy-policy/newsletter-subscription/NewsletterSubscription';
import { SocialNetworks } from '~/shared/components/privacy-policy/social-networks/SocialNetworks';
import { TargetedAds } from '~/shared/components/privacy-policy/targeted-ads/TargetedAds';
import { UserRights } from '~/shared/components/privacy-policy/user-rights/UserRights';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useStore } from '~/store';


const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  'DataWeCollect': DataWeCollect,
  'DataUsage': DataUsage,
  'Cookies': Cookies,
  'GoogleAuth': GoogleAuth,
  'SocialNetworks': SocialNetworks,
  'TargetedAds': TargetedAds,
  'NewsletterSubscription': NewsletterSubscription,
  'DataRetention': DataRetention,
  'UserRights': UserRights,
  'ContactUs': ContactUs
};

export default function Page() {
  const pageSlug = PAGE_IDS.PRIVACY_POLICY;

  const blocksOrder = useStore((s) => s.blocksOrder[pageSlug]);
  const setBlocksOrder = useStore((s) => s.setBlocksOrder);

  const sortableBlocks = blocksOrder?.filter((blockId) => blockId !== 'IntroSection');

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, sortableBlocks, (reordered) => {
      setBlocksOrder(pageSlug, ['IntroSection', ...reordered]);
    });
  };

  return (
    <EditablePageLayout headerTitle="Політика конфіденційності" pageSlug={pageSlug}>
      <IntroSection />
      {sortableBlocks && sortableBlocks.length > 0 && (
        <SortableList onDragEnd={handleDragEnd} id="1" items={sortableBlocks}>
          {sortableBlocks.map((blockId) => {
            const BlockComponent = BLOCKS_CONFIG[blockId];

            return (
              <SortableItemWrapper id={blockId} key={blockId}>
                {BlockComponent && <BlockComponent />}
              </SortableItemWrapper>
            );
          })}
        </SortableList>
      )}
    </EditablePageLayout>

  );
}
