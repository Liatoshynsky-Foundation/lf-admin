import '@testing-library/jest-dom';
import React from 'react';

import { editPagesCommonTests } from '../__mocks__/edit-pages-factory';
import Page from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';

jest.mock('~/shared/components/artistry/TitleWithQuote/TitleWithQuote', () => ({
  TitleWithQuote: () => <div data-testid="title-with-quote">TitleWithQuote</div>
}));

jest.mock('~/shared/components/artistry/MusicTableSection/MusicTableSection', () => ({
  MusicTableSection: () => <div data-testid="music-table">MusicTableSection</div>
}));

jest.mock('~/shared/components/sortable-list/SortableList');

describe('Artistry Page', () => {
  editPagesCommonTests({
    Page,
    pageId: PAGE_IDS.ARTISTRY,
    childTestIds: ['title-with-quote', 'music-table'],
    expectedReorderedBlocks: ['title-with-quote', 'music-table']
  });
});
