import { JSONContent } from '@tiptap/react';

import { ImageBlock, TipTapQuoteBlock, WithHidden } from '~/types/common';

export interface IntroSectionBlock extends WithHidden {
  title: JSONContent;
  image: ImageBlock;
  quote: TipTapQuoteBlock;
}
