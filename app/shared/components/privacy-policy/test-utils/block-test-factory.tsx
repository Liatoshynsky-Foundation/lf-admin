import { fireEvent, render, screen } from '@testing-library/react';

import { mockAddPoint, mockRemovePoint, mockUpdatePoint, usePageBlockMock } from '../__mocks__/setup-mocks';
import { createDocNode } from '~/__mocks__/utils';
import { LocalizedJSON } from '~/types/common';


const mockTitleJson = createDocNode('Initial title');
const commonText = 'Text';
const mockDescriptionJson = createDocNode(commonText);
const mockListPointJson = createDocNode('Initial the first list item');
const mockNoteJson = createDocNode('Initial note');

const LABELS = {
  description: 'Вступний текст секції',
  note: 'Додаткова інформація',
  list: 'Текст пункту',
  title: 'Вступний текст секції',
  paragraph: 'Текст 1 абзацу',
};

export interface BaseBlock {
  title?: LocalizedJSON;
  description?: LocalizedJSON;
  list?: Array<{ id: string } & LocalizedJSON>;
  note?: LocalizedJSON;
  [key: string]: unknown;
}

export const createStandardMockBlock = () => ({
  block: {
    title: { uk: mockTitleJson, en: mockTitleJson },
    description: { uk: mockDescriptionJson, en: mockDescriptionJson },
    list: [{ id: '1', uk: mockListPointJson, en: mockListPointJson }],
    note: { uk: mockNoteJson, en: mockNoteJson },
  },
  expectedValues: {
    title: mockTitleJson,
    description: mockDescriptionJson,
    list: mockListPointJson,
    note: mockNoteJson
  }
});

interface CommonTestProps {
  Component: React.ElementType;
  mockBlock: BaseBlock | null;

  checkDescription?: boolean;
  checkNote?: boolean;
  checkTitle?: boolean;
  checkList?: boolean;
  checkParagraph?: boolean;
  usePointsListMock?: jest.Mock;
}

export const runCommonBlockTests = ({
  Component,
  mockBlock,
  checkDescription,
  checkNote,
  checkTitle,
  checkList,
  checkParagraph,
  usePointsListMock
}: CommonTestProps) => {

  beforeEach(() => {
    jest.clearAllMocks();
    if (usePointsListMock) {
      usePointsListMock.mockReturnValue({
        addPoint: mockAddPoint,
        removePoint: mockRemovePoint,
        updatePoint: mockUpdatePoint,
        points: [{ id: '1', text: 'Текст пункту' }]
      });
    }
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  const runSimulation = (blockData: BaseBlock | null = mockBlock, testidToClick?: string) => {
    usePageBlockMock.mockReturnValue({ block: blockData });
    render(<Component />);

    if (testidToClick) {
      fireEvent.click(screen.getByTestId(testidToClick));
    }
  };

  it('should render collapsible block', () => {
    runSimulation();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);

    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  if (checkTitle) {
    it('should render title with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${LABELS.title}`)).toHaveTextContent(JSON.stringify(mockTitleJson));
    });
  }

  if (checkDescription) {
    it('should render description with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${LABELS.description}`)).toHaveTextContent(JSON.stringify(mockDescriptionJson));
    });
  }

  if (checkParagraph) {
    it('should render paragraph with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${LABELS.paragraph}`)).toBeInTheDocument();
    });
  }

  if (checkNote) {
    it('should render note text field with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${LABELS.note}`)).toHaveTextContent(JSON.stringify(mockNoteJson));
    });
  }

  if (checkList && usePointsListMock) {
    it('should render list of points with deep initial JSON content', () => {
      runSimulation();

      const elements = screen.getAllByTestId(`textfield-json-${LABELS.list}`);
      expect(elements.length).toBeGreaterThan(0);
    });
  }
};
