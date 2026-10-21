import { JSONContent } from '@tiptap/react';
import React from 'react';

import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { getEventValue } from '~/src/shared/utils/formHelpers';
import { useStore } from '~/store';
import { LocalizedJSON } from '~/types/common';

type PageId = (typeof PAGE_IDS)[keyof typeof PAGE_IDS];
type BlockId = (typeof BLOCK_IDS)[keyof typeof BLOCK_IDS];

type SetFieldFn = (pageId: PageId, blockId: BlockId, field: string, value: unknown) => void;

type LocalizedContent = LocalizedJSON | Partial<LocalizedJSON>;
type LocalizedContentKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends LocalizedContent ? K : never;
}[keyof T];

export const useBlockFieldHandlers = <T extends object>(
  pageId: PageId,
  blockId: BlockId,
  currentLocale: 'uk' | 'en',
  blockData: T | undefined
) => {
  const setField = useStore((state) => state.setField);
 
  const handleLocalizedTextChange =
    (field: string) => (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const textValue = getEventValue(e);

      const fieldData = blockData?.[field as keyof T] as Record<'uk' | 'en', string> | undefined;

      (setField as SetFieldFn)(pageId, blockId, field, {
        uk: fieldData?.uk || '',
        en: fieldData?.en || '',
        [currentLocale]: textValue
      });
    };

  const handleLocalizedContentChange = (field: LocalizedContentKeys<T>) => (val: JSONContent) => {
    const fieldData = blockData?.[field] as LocalizedContent | undefined;

    (setField as SetFieldFn)(pageId, blockId, field as string, {
      ...fieldData,
      [currentLocale]: val
    });
  };

  return { handleLocalizedTextChange, handleLocalizedContentChange };
};
