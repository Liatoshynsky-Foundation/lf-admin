import { fireEvent, render, screen } from '@testing-library/react';

import { IntroSection } from './IntroSection';
import { createDocNode } from '~/__mocks__/utils';

const usePageBlockMock = jest.fn();
const setFieldMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

beforeAll(() => {
  let counter = 0;
  crypto.randomUUID = jest.fn(() => `uuid-${++counter}`) as typeof crypto.randomUUID;
});

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');

const mockTrustAndSecurityJson = createDocNode('Initial trust and security');
const mockAgreementJson = createDocNode('Initial agreement');


const mockBlock = {
  trustAndSecurity: { uk: mockTrustAndSecurityJson, en: mockTrustAndSecurityJson },
  agreement: { uk: mockAgreementJson, en: mockAgreementJson },
};

const keys = {
  paragraph1: 'Текст 1 абзацу',
  paragraph2: 'Текст 2 абзацу',
};

const runSimulation = (blockData: unknown = mockBlock, testidToClick?: string) => {
  usePageBlockMock.mockReturnValue({ block: blockData });
  render(<IntroSection />);

  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('IntroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    runSimulation();
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${keys.paragraph1}`)).toHaveTextContent(JSON.stringify(mockTrustAndSecurityJson));
    expect(screen.getByTestId(`textfield-json-${keys.paragraph2}`)).toHaveTextContent(JSON.stringify(mockAgreementJson));
  });

  it('should render skeleton when no block exists', () => {
    runSimulation(null);
    expect(screen.queryByTestId('collapsible')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});

