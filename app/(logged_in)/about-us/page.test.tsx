import '@testing-library/jest-dom';
import React from 'react';

import { editPagesCommonTests  } from '../__mocks__/edit-pages-factory';
import Page from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';


jest.mock('~/shared/components/about-us/Intro-section/IntroSection', () => ({
  IntroSection: () => <div data-testid="intro">IntroSection</div>
}));

jest.mock('~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation', () => ({
  LiatoshynskyFoundation: () => <div data-testid="foundation">LiatoshynskyFoundation</div>
}));

jest.mock('~/shared/components/about-us/our-mission/OurMission', () => ({
  __esModule: true,
  default: () => <div data-testid="mission">OurMission</div>
}));

jest.mock('~/shared/components/about-us/our-goals/OurGoals', () => ({
  __esModule: true,
  default: () => <div data-testid="goals">OurGoals</div>
}));

jest.mock('~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office', () => ({
  LiatoshynskyOffice: () => <div data-testid="office">LiatoshynskyOffice</div>
}));

jest.mock('~/shared/components/about-us/what-we-do/WhatWeDo', () => ({
  __esModule: true,
  default: () => <div data-testid="what-we-do">WhatWeDo</div>
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
      'foundation',
      'mission',
      'goals',
      'office',
      'what-we-do',
      'founders'
    ],
    expectedReorderedBlocks: ['intro', 'mission', 'goals']
  });
});
