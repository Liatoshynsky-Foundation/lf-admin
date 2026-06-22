import React from 'react';

import { EditParagraphsBlock } from '../components/edit-paragraphs-block/EditParagraphsBlock';
import { BLOCK_IDS } from '~/constants/pageBlocks';

export const TargetedAds = () => {
  const blockId = BLOCK_IDS.TARGETED_ADS;
  const title = 'Таргетована реклама';

  return <EditParagraphsBlock blockId={blockId} title={title} />;
};