import React from 'react';

import { EditParagraphsBlock } from '../components/edit-paragraphs-block/EditParagraphsBlock';
import { BLOCK_IDS } from '~/constants/pageBlocks';

export const SocialNetworks = () => {
  const blockId = BLOCK_IDS.SOCIAL_NETWORKS;
  const title = 'Соціальні мережі';
  
  return <EditParagraphsBlock blockId={blockId} title={title} />;
};