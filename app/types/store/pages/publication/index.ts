export * from './blocks/publications-intro';

import { PublicationsIntroBlock } from './blocks/publications-intro';

export interface PublicationsBlocksMap {
  PublicationsIntro: PublicationsIntroBlock;
}

export interface PublicationsPage {
  pageType: 'PublicationsPage';
  blocks: PublicationsBlocksMap;
  blocksOrder: (keyof PublicationsBlocksMap)[];
}
