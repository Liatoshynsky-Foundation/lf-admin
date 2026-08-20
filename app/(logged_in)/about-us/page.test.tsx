import '@testing-library/jest-dom';
import React from 'react';

import { editPagesCommonTests  } from '../__mocks__/edit-pages-factory';
import Page from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';


jest.mock('~/shared/components/about-us/intro-section/IntroSection', () => ({
  IntroSection: () => <div data-testid="intro">IntroSection</div>
}));

jest.mock('~/shared/components/block/Block', () => ({
  Block: ({ blockId }: { blockId: string }) => <div data-testid={blockId}>{blockId}</div>
}));

jest.mock('~/shared/components/about-us/foundation-founders/FoundationFounders', () => ({
  FoundationFounders: () => <div data-testid="founders">FoundationFounders</div>
}));

jest.mock('~/shared/components/sortable-list/SortableList');


describe('About Page', () => {
  editPagesCommonTests({
    Page,
    pageId: PAGE_IDS.ABOUT_US,
    childTestIds: [
      'intro',
      'FoundationInfo',
      'OurMission',
      'OurGoals',
      'LiatoshynskyOffice',
      'WhatWeDo',
      'founders'
    ],
    expectedReorderedBlocks: ['intro', 'mission', 'goals']
  });
});
