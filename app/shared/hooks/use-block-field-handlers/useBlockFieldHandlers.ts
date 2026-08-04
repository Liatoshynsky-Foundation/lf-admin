import { JSONContent } from '@tiptap/react';
import React from 'react';

import { BLOCK_IDS,PAGE_IDS } from '~/constants/pageBlocks';
import { getEventValue } from '~/src/shared/utils/formHelpers';
import { useStore } from '~/store';

type PageId = (typeof PAGE_IDS)[keyof typeof PAGE_IDS];
type BlockId = (typeof BLOCK_IDS)[keyof typeof BLOCK_IDS];

type SetFieldFn = (pageId: PageId, blockId: BlockId, field: string, value: unknown) => void;

export const useBlockFieldHandlers = (
  pageId: PageId,
  blockId: BlockId,
  currentLocale: 'uk' | 'en',
  blockData: unknown
) => {
  const setField = useStore((state) => state.setField);

  const data = blockData as Record<string, unknown> | undefined;

  const handleLocalizedTextChange =
    (field: string) => (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const textValue = getEventValue(e);

      const fieldData = data?.[field] as Record<'uk' | 'en', string> | undefined;

      (setField as SetFieldFn)(pageId, blockId, field, {
        uk: fieldData?.uk || '',
        en: fieldData?.en || '',
        [currentLocale]: textValue
      });
    };

  const handleDescriptionChange = (val: JSONContent) => {
    const descData = data?.description as Record<'uk' | 'en', JSONContent> | undefined;

    (setField as SetFieldFn)(pageId, blockId, 'description', {
      ...(descData),
      [currentLocale]: val
    });
  };

  return { handleLocalizedTextChange, handleDescriptionChange };
};
