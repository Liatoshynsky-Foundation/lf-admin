import { fireEvent, render, screen } from '@testing-library/react';

import { ContactUs } from './ContactUs';
import { createDocNode, createParagraphNode } from '~/__mocks__/utils';

export const usePageBlockMock = jest.fn();
const setFieldMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));
beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
});
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');

const mockTitleJson = createDocNode('Initial title');
const mockDescriptionJson = createDocNode('Initial description');


export const mockBlock = {
  title: { uk: mockTitleJson, en: mockTitleJson },
  description: { uk: mockDescriptionJson, en: mockDescriptionJson },
};

const keys = {
  descriptionParagraph: 'Текст 1 абзацу',
};

export const runSimulation = (blockData: unknown = mockBlock, testidToClick?: string) => {
  usePageBlockMock.mockReturnValue({ block: blockData });
  render(<ContactUs />);

  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('ContactUs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    runSimulation();
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${keys.descriptionParagraph}`)).toHaveTextContent(JSON.stringify(createParagraphNode('Initial description', 'uuid-1')));
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);
    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});

