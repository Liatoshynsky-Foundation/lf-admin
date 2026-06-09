import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { usePageBlockMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock } from '../test-utils/block-test-factory';
import { DataWeCollect } from './DataWeCollect';
import { createDocNode } from '~/__mocks__/utils';
import { DataWeCollectBlock } from '~/types/store/pages/privacy-policy';


jest.mock('~/components/configurable-list/ConfigurableList');

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');

const { block: standardMockBlock, expectedValues } = createStandardMockBlock();

const mockNoteJson = createDocNode('Initial note');
const mockSubtitleJson = createDocNode('Initial subtitle');
const mockListItem1 = createDocNode('Initial list item 1');

const mockBlock: DataWeCollectBlock = {
  ...standardMockBlock,
  sections: [{ id: '1', list: [{ uk: mockListItem1, en: mockListItem1 }], subtitle: { uk: mockSubtitleJson, en: mockSubtitleJson } }],
  note: { uk: mockNoteJson, en: mockNoteJson },
};

const keys = {
  description: 'Вступний текст секції',
  list: 'Список 1',
  listItem: 'Текст пункту',
  note: 'Додаткова інформація',
};

const runSimulation = (blockData: unknown = mockBlock, testidToClick?: string) => {
  usePageBlockMock.mockReturnValue({ block: blockData });
  render(<DataWeCollect />);

  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};


describe('DataWeCollect', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    runSimulation();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${keys.description}`)).toHaveTextContent(JSON.stringify(expectedValues.description));
    expect(screen.getByTestId(`textfield-json-${keys.list}`)).toHaveTextContent(JSON.stringify(mockSubtitleJson));
    expect(screen.getByTestId(`textfield-json-${keys.listItem}`)).toHaveTextContent(JSON.stringify(mockListItem1));

    expect(screen.getByTestId(`textfield-json-${keys.note}`)).toHaveTextContent(JSON.stringify(mockNoteJson));
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);
    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});



