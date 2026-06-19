import React from 'react';

import { EditParagraphsBlock } from '../components/edit-paragraphs-block/EditParagraphsBlock';
import { BLOCK_IDS } from '~/constants/pageBlocks';

export const DataRetention = () => {
  const blockId = BLOCK_IDS.DATA_RETENTION;
  const title = 'Як ми зберігаємо ваші дані';
  
  return <EditParagraphsBlock blockId={blockId} title={title} />;
};