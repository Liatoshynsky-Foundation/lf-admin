import { fireEvent, render, screen } from '@testing-library/react';

import { mockAddPoint, mockRemovePoint, mockUpdatePoint, usePageBlockMock } from '../__mocks__/setup-mocks';
import { createDocNode, createParagraphNode } from '~/__mocks__/utils';


const mockTitleJson = createDocNode('Initial title');
const commonText = 'Text';
const mockDescriptionJson = createDocNode(commonText);
const mockParagraphJson = createParagraphNode(commonText, 'uuid-1');
const mockListPointJson = createDocNode('Initial the first list item');
const mockNoteJson = createDocNode('Initial note');


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
  mockBlock: unknown;

  descriptionKey?: string;
  paragraphKey?: string;
  noteKey?: string;
  titleKey?: string;
  usePointsListMock?: jest.Mock;
}

export const runCommonBlockTests = ({ Component, mockBlock, descriptionKey, paragraphKey, noteKey, titleKey, usePointsListMock }: CommonTestProps) => {

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

  const runSimulation = (blockData: unknown = mockBlock, testidToClick?: string) => {
    usePageBlockMock.mockReturnValue({ block: blockData });
    render(<Component />);

    if (testidToClick) {
      fireEvent.click(screen.getByTestId(testidToClick));
    }
  };

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    runSimulation();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);

    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  if (titleKey) {
    it('should render title with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${titleKey}`)).toHaveTextContent(JSON.stringify(mockTitleJson));
    });
  }

  if (descriptionKey) {
    it('should render description with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${descriptionKey}`)).toHaveTextContent(JSON.stringify(mockDescriptionJson));
    });
  }

  if (paragraphKey) {
    it('should render paragraph with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${paragraphKey}`)).toHaveTextContent(JSON.stringify(mockParagraphJson));
    });
  }

  if (noteKey) {
    it('should render note text field with deep initial JSON content', () => {
      runSimulation();
      expect(screen.getByTestId(`textfield-json-${noteKey}`)).toHaveTextContent(JSON.stringify(mockNoteJson));
    });
  }

  if (usePointsListMock) {
    it('should render list of points with deep inital JSON content', () => {
      runSimulation();
    });
  }
};
