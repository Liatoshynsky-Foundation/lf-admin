import { render, screen } from '@testing-library/react';

import { usePageBlockMock } from '../__mocks__/setup-mocks';
import { runCommonBlockTests } from '../test-utils/block-test-factory';
import { IntroSection } from './IntroSection';
import { createDocNode } from '~/__mocks__/utils';

beforeAll(() => {
  let counter = 0;
  crypto.randomUUID = jest.fn(() => `uuid-${++counter}`) as typeof crypto.randomUUID;
});
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

describe('IntroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });
  runCommonBlockTests({
    Component: IntroSection,
    mockBlock,
  });
  it('should render trust and security & agreement paragraphs', () => {
    render(<IntroSection />);
    expect(screen.getByTestId(`textfield-json-${keys.paragraph1}`)).toHaveTextContent(JSON.stringify(mockTrustAndSecurityJson));
    expect(screen.getByTestId(`textfield-json-${keys.paragraph2}`)).toHaveTextContent(JSON.stringify(mockAgreementJson));
  });
});

