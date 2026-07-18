import { JSONContent } from '@tiptap/react';

import { TipTapQuoteBlock } from '~/types/common';

export interface LiatoshynskyOfficeBlock {
  quote: TipTapQuoteBlock;
  title?: Record<'uk' | 'en', JSONContent>;
  hidden?: boolean;
}
