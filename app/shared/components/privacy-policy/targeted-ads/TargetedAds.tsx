import { JSONContent } from '@tiptap/react';
import React from 'react';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const TargetedAds = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.TARGETED_ADS;

  const setField = useStore((value) => value.setField);
  const currentLocale = useStore((value) => value.locale);

  const { block } = usePageBlock(pageId, blockId);

  if (!block) return <EditBlockSkeleton />;

  const onParagraphChange = (index: number, val: JSONContent) => {
    const currentContentArray = [...block.description[currentLocale].content || []];
    currentContentArray[index] = val;

    setField(pageId, blockId, 'description', {
      ...block.description,
      [currentLocale]: currentContentArray
    });
  };

  const paragraphs = ensureIds(block.description[currentLocale].content || []);
  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <CollapsibleBlock title="Таргетована реклама">
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