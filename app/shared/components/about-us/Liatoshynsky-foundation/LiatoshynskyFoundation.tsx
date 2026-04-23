'use client';

import { Skeleton } from '@mui/material';
import React from 'react';

import { FoundationBlock } from './foundation-block/FoundationBlock';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { proseToText, textToProse } from '~/lib/utils/prose';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { ProseDoc } from '~/types/common';
import { getImageUrl } from '~/utils/getImageUrl';

export const LiatoshynskyFoundation = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.LIATOSHYNSKY_FOUNDATION;

  const { block } = usePageBlock(pageId, blockId);

  const setField = useStore((state) => state.setField);

  const currentLocale: 'uk' | 'en' = useStore((state) => state.locale);

  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const mainText = proseToText(block.ourOrganisation?.[currentLocale]);
  const handleMainTextChange = (val: string) => {
    setField(pageId, blockId, 'ourOrganisation', {
      ...block.ourOrganisation,
      [currentLocale]: textToProse(val)
    });
  };

  type LocalizedProse = Record<'uk' | 'en', ProseDoc | undefined>;

  const paragraphKeys: (keyof typeof block)[] = ['ourName', 'ourBelief'];

  const paragraphs = paragraphKeys.map((key) => {
    const localized = block[key] as LocalizedProse | undefined;
    return {
      text: proseToText(localized?.[currentLocale])
    };
  });

  const handleParagraphChange = (index: number, val: string) => {
    const key = paragraphKeys[index];
    setField(pageId, blockId, key, {
      ...block[key],
      [currentLocale]: textToProse(val)
    });
  };

  return (
    <CollapsibleBlock title="Фундація Лятошинського">
      <FoundationBlock
        mainText={mainText}
        paragraphs={paragraphs}
        imageUrl={getImageUrl(block.image)}
        fileName={block.image?.caption?.[currentLocale]}
        initialCrop={block.image?.crop}
        onMainTextChange={handleMainTextChange}
        onParagraphChange={handleParagraphChange}
        onImageChange={(url: string, crop?: MediaModalResult['crop']) => {
          setField(pageId, blockId, 'image', {
            ...block.image,
            src: url,
            isTmp: false,
            crop: crop ?? null
          } as typeof block.image);
        }}
      />
    </CollapsibleBlock>
  );
};
