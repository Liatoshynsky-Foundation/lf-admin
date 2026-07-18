import { JSONContent } from '@tiptap/react';

import { TipTapQuoteBlock, WithHidden } from '~/types/common';

export interface LiatoshynskyOfficeBlock extends WithHidden {
  quote: TipTapQuoteBlock;
  title?: Record<'uk' | 'en', JSONContent>;
}
