'use client';

import { JSONContent } from '@tiptap/react';

import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { QuoteBlock } from './quote-block/QuoteBlock';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { proseToHeaderText } from '~/lib/utils/prose';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { LocalizedString, ProseDoc } from '~/types/common';

export const LiatoshynskyOffice = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.LIATOSHYNSKY_OFFICE;

  const { block } = usePageBlock(pageId, blockId);
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);

  if (!block) return <EditBlockSkeleton />;

  const handleSectionTitleChange = (val: JSONContent) => {
    const fallbackTitle: Record<'uk' | 'en', JSONContent> = { uk: {} as JSONContent, en: {} as JSONContent };

    setField(pageId, blockId, 'title', {
      ...(block.title ?? fallbackTitle),
      [currentLocale]: val
    });
  };

  const handleTitleChange = (val: JSONContent) => {
    setField(pageId, blockId, 'quote', {
      source: {
        ...block.quote.source,
        [currentLocale]: val
      },
      text: block.quote.text
    });
  };

  const handleDescriptionChange = (val: JSONContent) => {
    setField(pageId, blockId, 'quote', {
      source: block.quote.source,
      text: {
        ...block.quote.text,
        [currentLocale]: val
      }
    });
  };

  const headerTitle = proseToHeaderText(block.title?.[currentLocale] as ProseDoc, 'Кабінет Лятошинського');

  return (
    <CollapsibleBlock
      title={headerTitle}
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <CustomTextField
        fieldType="formatting"
        title="Заголовок секції"
        label="Текст заголовку"
        value={block.title?.[currentLocale]}
        onChange={handleSectionTitleChange}
      />
      <QuoteBlock
        title={block.quote.source[currentLocale]}
        description={block.quote.text[currentLocale]}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />
    </CollapsibleBlock>
  );
};
