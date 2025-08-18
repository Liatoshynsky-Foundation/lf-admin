'use client';

import React from 'react';

import { FoundationBlock } from './foundation-block/FoundationBlock';
import { hardcodedData } from './LiatoshynskyFoundation.const';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import useInitBlock from '~/shared/hooks/use-init-block/useInitBlock';
import { useStore } from '~/store';

export const LiatoshynskyFoundation = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.LIATOSHYNSKY_FOUNDATION;

  const block = useInitBlock(pageId, blockId, hardcodedData);

  const setField = useStore((state) => state.setField);

  const handleMainTextChange = (val: string) => {
    setField(pageId, blockId, 'mainText', val);
  };

  const handleParagraphsChange = (index: number, val: string) => {
    const updatedParagraphs = [...(block.paragraphs || [])];
    updatedParagraphs[index] = { ...updatedParagraphs[index], text: val };
    setField(pageId, blockId, 'paragraphs', updatedParagraphs);
  };

  const handleImageChange = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);

    setField(pageId, blockId, 'image', newImageUrl);

    setField(pageId, blockId, 'imageFileName', file.name);
  };

  return (
    <CollapsibleBlock title="Фундація Лятошинського">
      <FoundationBlock
        mainText={block.mainText || ''}
        paragraphs={block.paragraphs || []}
        imageUrl={`/images/${block.image || ''}`}
        fileName={block.imageFileName}
        onMainTextChange={handleMainTextChange}
        onParagraphsChange={handleParagraphsChange}
        onImageChange={handleImageChange}
      />
    </CollapsibleBlock>
  );
};
