import React from 'react';

import { EditParagraphsBlock } from '../components/edit-paragraphs-block/EditParagraphsBlock';
import { BLOCK_IDS } from '~/constants/pageBlocks';

export const NewsletterSubscription = () => {
  const blockId = BLOCK_IDS.NEWSLETTER_SUBSCRIPTION;
  const title = 'Підписка на новини та відмова від розсилки';


  return <EditParagraphsBlock blockId={blockId} title={title} />;
};