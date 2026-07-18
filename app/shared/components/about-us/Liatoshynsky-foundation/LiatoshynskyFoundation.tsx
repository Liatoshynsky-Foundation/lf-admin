'use client';

import { JSONContent } from '@tiptap/react';
import React from 'react';

import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { FoundationBlock } from './foundation-block/FoundationBlock';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { proseToHeaderText, proseToText } from '~/lib/utils/prose';
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
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const currentLocale: 'uk' | 'en' = useStore((state) => state.locale);

  if (!block) return <EditBlockSkeleton />;

  const handleTitleChange = (val: JSONContent) => {
    setField(pageId, blockId, 'title', {
      ...block.title,
      [currentLocale]: val
    });
  };

  const mainText = block.ourOrganisation?.[currentLocale];
  const handleMainTextChange = (val: JSONContent) => {
    setField(pageId, blockId, 'ourOrganisation', {
      ...block.ourOrganisation,
      [currentLocale]: val
    });
  };

  type LocalizedProse = Record<'uk' | 'en', JSONContent>;

  const paragraphKeys: ('ourName' | 'ourBelief')[] = ['ourName', 'ourBelief'];

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

  const headerTitle = proseToHeaderText(block.title?.[currentLocale] as ProseDoc, 'Фундація Лятошинського');

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
        onChange={handleTitleChange}
      />
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
