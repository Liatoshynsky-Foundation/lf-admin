export * from './blocks/pageCaptionBlock';

import type { PageCaptionBlock } from './blocks/pageCaptionBlock';

export interface ArchiveBlocksMap {
  PageCaption: PageCaptionBlock;
}

export interface ArchivePage {
  pageType: 'ArchivePage';
  blocks: ArchiveBlocksMap;
  blocksOrder: (keyof ArchiveBlocksMap)[];
}