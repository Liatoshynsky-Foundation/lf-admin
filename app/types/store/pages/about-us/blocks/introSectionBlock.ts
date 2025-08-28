import { ImageBlock, LocalizedString, QuoteBlock } from '~/types/common';

export interface IntroSectionBlock {
  title: LocalizedString;
  image: ImageBlock;
  quote: QuoteBlock;
}
