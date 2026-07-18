import { JSONContent } from '@tiptap/react';

import { ImageBlock, TipTapQuoteBlock } from '~/types/common';

export interface IntroSectionBlock {
  title: JSONContent;
  image: ImageBlock;
  quote: TipTapQuoteBlock;
  hidden?: boolean;
}
