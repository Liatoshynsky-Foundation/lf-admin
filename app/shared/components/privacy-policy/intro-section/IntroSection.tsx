import { JSONContent } from '@tiptap/react';
import React from 'react';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { IntroSectionBlock } from '~/types/store/pages/privacy-policy';

export const IntroSection = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.PRIVACY_INTRO_SECTION;

  const setField = useStore((value) => value.setField);
  const currentLocale = useStore((value) => value.locale);

  const { block } = usePageBlock(pageId, blockId);

  if (!block) return <EditBlockSkeleton />;

  const paragraphsKeys = ['trustAndSecurity', 'agreement'] as const;

  const onParagraphChange = (val: JSONContent, fieldKey: 'trustAndSecurity' | 'agreement') => {

    const newDescription: IntroSectionBlock[typeof fieldKey] = {
      ...block[fieldKey],
      [currentLocale]: val
    };

    setField(pageId, blockId, fieldKey, newDescription);
  };

  const paragraphs = ensureIds(paragraphsKeys.map((key) =>
    ({
      key,
      value: block[key][currentLocale]
    })
  ));

  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <CollapsibleBlock title="Вступна секція">
      {paragraphs.map((paragraphNode, i) =>
        (
          <CustomTextField
            fieldType="formatting"
            key={paragraphNode.id}
            title={`Текст ${i + 1} абзацу`}
            label="Текст"
            value={paragraphNode.value}
            onChange={(value) => onParagraphChange(value, paragraphNode.key)}
          />
        )
      )}
    </CollapsibleBlock>
  );
};