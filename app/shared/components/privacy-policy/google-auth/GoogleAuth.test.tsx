import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { GoogleAuth } from './GoogleAuth';
import { createDocNode } from '~/__mocks__/utils';
import { usePointsList } from '~/shared/hooks/use-points-list/usePointsList';
import { GoogleAuthBlock } from '~/types/store/pages/privacy-policy';

const usePageBlockMock = jest.fn();
const setFieldMock = jest.fn();

const mockAddPoint = jest.fn();
const mockRemovePoint = jest.fn();
const mockUpdatePoint = jest.fn();


jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));
jest.mock('~/shared/hooks/use-points-list/usePointsList', () => ({
  usePointsList: jest.fn()
}));



jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');

interface MockPoinstsListProps<T> {
  points: T[],
  addPoint: () => T;
}
jest.mock('../components/points-list/PointsList', () => ({
  PointsList: <T extends { readonly id: string; readonly value: JSONContent }>({ addPoint, points }: MockPoinstsListProps<T>) => (
    <div data-testid="points-list">
      <button data-testid="trigger-add-point" onClick={addPoint}>Add</button>
      <span data-testid="points-count">{points.length}</span>
    </div>
  )
}));


const mockTitleJson = createDocNode('Initial title');
const mockDescriptionJson = createDocNode('Initial description');
const mockListPointJson = createDocNode('Initial the first list item');
const mockNoteJson = createDocNode('Initial note');

const mockBlock: GoogleAuthBlock = {
  title: { uk: mockTitleJson, en: mockTitleJson },
  description: { uk: mockDescriptionJson, en: mockDescriptionJson },
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

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
});

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
    expect(screen.getByTestId(`textfield-json-${keys.description}`)).toHaveTextContent(JSON.stringify(mockDescriptionJson));
    expect(screen.getByTestId('points-count')).toHaveTextContent('1');
    expect(screen.getByTestId(`textfield-json-${keys.note}`)).toHaveTextContent(JSON.stringify(mockNoteJson));
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);
    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});



