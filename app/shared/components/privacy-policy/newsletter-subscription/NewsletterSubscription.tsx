import { JSONContent } from '@tiptap/react';
import React from 'react';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { NewsletterSubscriptionBlock } from '~/types/store/pages/privacy-policy';

export const NewsletterSubscription = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.NEWSLETTER_SUBSCRIPTION;

  const setField = useStore((value) => value.setField);
  const currentLocale = useStore((value) => value.locale);

  const { block } = usePageBlock(pageId, blockId);

  if (!block) return <EditBlockSkeleton />;

  const onParagraphChange = (index: number, val: JSONContent) => {
    const currentContentArray = [...block.description[currentLocale].content || []];
    currentContentArray[index] = val;

    const newParagraph: NewsletterSubscriptionBlock['description'] = {
      ...block.description,
      [currentLocale]: currentContentArray
    };

    setField(pageId, blockId, 'description', newParagraph);
  };

  const paragraphs = ensureIds(block.description[currentLocale].content || []);
  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <CollapsibleBlock title="Підписка на новини та відмова від розсилки">
      {paragraphs.map((paragraphNode, i) =>
        (
          <CustomTextField
            fieldType="formatting"
            key={paragraphNode.id}
            title={`Текст ${i + 1} абзацу`}
            label="Текст"
            value={paragraphNode}
            onChange={(value) => onParagraphChange(i, value)}
          />
        )
      )}
    </CollapsibleBlock>
  );
};