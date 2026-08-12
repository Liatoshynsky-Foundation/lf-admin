'use client';
import { DragEndEvent } from '@dnd-kit/core';

import { descriptionListNoteConfig } from '~/constants/blockSchemas';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { Block } from '~/shared/components/block/Block';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import {
  descriptionListNoteAdapter,
  DescriptionListNoteBlock
} from '~/shared/components/privacy-policy/components/edit-description-list-note-block/descriptionListNote.adapter';
import { ContactUs } from '~/shared/components/privacy-policy/contact-us/ContactUs';
import { DataRetention } from '~/shared/components/privacy-policy/data-retention/DataRetention';
import { dataUsageAdapter } from '~/shared/components/privacy-policy/data-usage/data-usage.adapter';
import { DataWeCollect } from '~/shared/components/privacy-policy/data-we-collect/DataWeCollect';
import { IntroSection } from '~/shared/components/privacy-policy/intro-section/IntroSection';
import { NewsletterSubscription } from '~/shared/components/privacy-policy/newsletter-subscription/NewsletterSubscription';
import { SocialNetworks } from '~/shared/components/privacy-policy/social-networks/SocialNetworks';
import { TargetedAds } from '~/shared/components/privacy-policy/targeted-ads/TargetedAds';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { useStore } from '~/store';
import { DataUsageBlock } from '~/types/store/pages/privacy-policy';

const DataUsageBlockView = () => (
  <Block
    pageId={PAGE_IDS.PRIVACY_POLICY}
    blockId={BLOCK_IDS.DATA_USAGE}
    config={descriptionListNoteConfig}
    adapter={dataUsageAdapter as BlockContentAdapter<DataUsageBlock>}
    title="Як ми використовуємо ваші дані"
  />
);

const CookiesBlockView = () => (
  <Block<DescriptionListNoteBlock>
    pageId={PAGE_IDS.PRIVACY_POLICY}
    blockId={BLOCK_IDS.COOKIES}
    config={descriptionListNoteConfig}
    adapter={descriptionListNoteAdapter}
    title="Які cookie ми використовуємо"
  />
);

const GoogleAuthBlockView = () => (
  <Block<DescriptionListNoteBlock>
    pageId={PAGE_IDS.PRIVACY_POLICY}
    blockId={BLOCK_IDS.GOOGLE_AUTH}
    config={descriptionListNoteConfig}
    adapter={descriptionListNoteAdapter}
    title="Авторизація через Google-акаунт"
  />
);

const UserRightsBlockView = () => (
  <Block<DescriptionListNoteBlock>
    pageId={PAGE_IDS.PRIVACY_POLICY}
    blockId={BLOCK_IDS.USER_RIGHTS}
    config={descriptionListNoteConfig}
    adapter={descriptionListNoteAdapter}
    title="Ваші права"
  />
);

const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  DataWeCollect: DataWeCollect,
  SocialNetworks: SocialNetworks,
  TargetedAds: TargetedAds,
  NewsletterSubscription: NewsletterSubscription,
  DataRetention: DataRetention,
  ContactUs: ContactUs,
  UserRights: UserRightsBlockView,
  GoogleAuth: GoogleAuthBlockView,
  DataUsage: DataUsageBlockView,
  Cookies: CookiesBlockView
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
