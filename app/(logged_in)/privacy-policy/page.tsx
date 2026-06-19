'use client';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { Header } from '~/shared/components/header/Header';
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
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useSortableDragEnd } from '~/shared/hooks/use-sortable-drag-end/useSortableDragEnd';
import { useStore } from '~/store';
import { useGetPageQuery } from '~/types/graphql/generated/graphql';


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
  const [isMounted, setIsMounted] = useState(false);

  const setLocale = useStore((s) => s.setLocale);
  const discardChanges = useStore((s) => s.discardChanges);

  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);
  const { data, loading: queryLoading } = useGetPageQuery({
    variables: { slug: pageSlug }
  });

  const setPageData = useStore((state) => state.setPageData);

  useEffect(() => {
    if (data?.pageBlocks) {
      setPageData(pageSlug, data.pageBlocks.blocks, data.pageBlocks.blocksOrder, true);
    }
  }, [data, setPageData, pageSlug]);

  const blocksOrder = useStore((s) => s.blocksOrder[pageSlug]);
  const setBlocksOrder = useStore((s) => s.setBlocksOrder);

  const sortableBlocks = blocksOrder?.filter((blockId) => blockId !== 'IntroSection');

  const { handleDragEnd } = useSortableDragEnd(sortableBlocks, (reordered) => {
    setBlocksOrder(pageSlug, ['IntroSection', ...reordered]);
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || queryLoading) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: '32px', width: '100%', gap: '32px' }}>
      <Header
        title="Політика конфіденційності"
        onPreview={preview}
        onSave={save}
        onCancel={() => discardChanges(pageSlug)}
        isSaving={editorLoading || saveLoading}
        onLanguageChange={(lang: 'uk' | 'en') => setLocale(lang)}
      />
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
    </Box>
  );
}
