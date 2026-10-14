export * from './blocks/hero-section';

import type { ResearchHeroBlock } from './blocks/hero-section';

export interface ResearchBlocksMap {
  HeroSection: ResearchHeroBlock;
}

export interface ResearchPage {
  pageType: 'ResearchPage';
  blocks: ResearchBlocksMap;
  blocksOrder: (keyof ResearchBlocksMap)[];
}
