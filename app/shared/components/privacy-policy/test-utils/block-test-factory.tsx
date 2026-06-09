import { fireEvent, render, screen } from '@testing-library/react';

import { createDocNode, createParagraphNode } from '~/__mocks__/utils';

export const createStandardMockBlock = () => {
  const mockTitleJson = createDocNode('Initial title');
  const mockDescriptionJson = createDocNode('Initial description');

  return {
    block: {
      title: { uk: mockTitleJson, en: mockTitleJson },
      description: { uk: mockDescriptionJson, en: mockDescriptionJson },
    },
    expectedValues: {
      title: mockTitleJson,
      description: mockDescriptionJson
    }
  };
};

interface CommonTestProps {
    Component: React.ElementType;
    mockBlock: unknown;
    usePageBlockMock: jest.Mock;
    descriptionParagraphKey: string;
}

export const runCommonBlockTests = ({ Component, mockBlock, usePageBlockMock, descriptionParagraphKey }: CommonTestProps) => {
  beforeEach(() => {
    jest.clearAllMocks();

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
    expect(screen.getByTestId(`textfield-json-${descriptionParagraphKey}`)).toHaveTextContent(JSON.stringify(createParagraphNode('Initial description', 'uuid-1')));
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);

    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
};
