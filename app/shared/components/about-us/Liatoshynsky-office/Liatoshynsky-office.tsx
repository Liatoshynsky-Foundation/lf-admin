'use client';

import { Skeleton } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { QuoteBlock } from './quote-block/QuoteBlock';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { LocalizedString } from '~/types/common';

export const LiatoshynskyOffice = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.LIATOSHYNSKY_OFFICE;

  const { block } = usePageBlock(pageId, blockId);
  const setField = useStore((state) => state.setField);

  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);

  if (!block) return <Skeleton sx={{ height: '60px' }} />;

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

  return (
    <CollapsibleBlock title="Кабінет Лятошинського">
      <QuoteBlock
        title={block.quote.source[currentLocale]}
        description={block.quote.text[currentLocale]}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />
    </CollapsibleBlock>
  );
};
