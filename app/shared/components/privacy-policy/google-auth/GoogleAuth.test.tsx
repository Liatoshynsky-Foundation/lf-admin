import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { mockAddPoint, mockRemovePoint, mockUpdatePoint, usePageBlockMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock } from '../test-utils/block-test-factory';
import { GoogleAuth } from './GoogleAuth';
import { createDocNode } from '~/__mocks__/utils';
import { usePointsList } from '~/shared/hooks/use-points-list/usePointsList';
import { GoogleAuthBlock } from '~/types/store/pages/privacy-policy';

jest.mock('~/shared/hooks/use-points-list/usePointsList', () => ({
  usePointsList: jest.fn()
}));

jest.mock('../components/points-list/PointsList');


const { block: standardMockBlock, expectedValues } = createStandardMockBlock();

const mockListPointJson = createDocNode('Initial the first list item');
const mockNoteJson = createDocNode('Initial note');

const mockBlock: GoogleAuthBlock = {
  ...standardMockBlock,
  list: [{ id: '1', uk: mockListPointJson, en: mockListPointJson }],
  note: { uk: mockNoteJson, en: mockNoteJson },
};

const keys = {
  listItem: 'Текст пункту',
  description: 'Вступний текст секції',
  note: 'Додаткова інформація'
};

const runSimulation = (blockData: unknown = mockBlock, testidToClick?: string) => {
  usePageBlockMock.mockReturnValue({ block: blockData });
  render(<GoogleAuth />);

  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('GoogleAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (usePointsList as jest.Mock).mockReturnValue({
      addPoint: mockAddPoint,
      removePoint: mockRemovePoint,
      updatePoint: mockUpdatePoint,
      points: []
    });
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    (usePointsList as jest.Mock).mockReturnValue({
      addPoint: mockAddPoint,
      removePoint: mockRemovePoint,
      updatePoint: mockUpdatePoint,
      points: [{ id: '1', text: 'Текст пункту' }]
    });
    runSimulation();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${keys.description}`)).toHaveTextContent(JSON.stringify(expectedValues.description));
    expect(screen.getByTestId('points-count')).toHaveTextContent('1');
    expect(screen.getByTestId(`textfield-json-${keys.note}`)).toHaveTextContent(JSON.stringify(mockNoteJson));
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);
    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});



