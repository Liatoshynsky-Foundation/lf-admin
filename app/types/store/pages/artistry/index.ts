export * from './blocks/artistryQuoteBlock';
export * from './blocks/musicTableSectionBlock';

import type { TitleWithQuoteBlock } from './blocks/artistryQuoteBlock';
import type { MusicTableSectionBlock } from './blocks/musicTableSectionBlock';

export interface ArtistryBlocksMap {
  TitleWithQuote: TitleWithQuoteBlock;
  MusicTableSection: MusicTableSectionBlock;
}

export interface ArtistryPage {
  pageType: 'ArtistryPage';
  blocks: ArtistryBlocksMap;
  blocksOrder: (keyof ArtistryBlocksMap)[];
}