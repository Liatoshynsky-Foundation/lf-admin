'use client';

import { Skeleton } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { FoundationBlock } from './foundation-block/FoundationBlock';
import { styles } from './LiatoshynskyFoundation.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { proseToText } from '~/lib/utils/prose';
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

  if (!block) return <Skeleton sx={styles.skeletonPlaceholder} />;

  const mainText = block.ourOrganisation?.[currentLocale];
  const handleMainTextChange = (val: JSONContent) => {
    setField(pageId, blockId, 'ourOrganisation', {
      ...block.ourOrganisation,
      [currentLocale]: val
    });
  };

  type LocalizedProse = Record<'uk' | 'en', JSONContent>;

  const paragraphKeys: (keyof typeof block)[] = ['ourName', 'ourBelief'];

  const paragraphs = paragraphKeys.map((key) => {
    const localized = block[key] as LocalizedProse;
    return {
      text: localized?.[currentLocale]
    };
  });

  const handleParagraphChange = (index: number, val: JSONContent) => {
    const key = paragraphKeys[index];
    setField(pageId, blockId, key, {
      ...block[key],
      [currentLocale]: val
    });
  };

  return (
    <CollapsibleBlock title="Фундація Лятошинського" grip>
      <FoundationBlock
        mainText={mainText}
        paragraphs={paragraphs}
        imageUrl={getImageUrl(block.image)}
        fileName={proseToText(block.image?.caption?.[currentLocale] as ProseDoc)}
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
