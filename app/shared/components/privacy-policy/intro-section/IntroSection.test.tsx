import { render, screen } from '@testing-library/react';

import { runCommonBlockTests } from '../test-utils/block-test-factory';
import { IntroSection } from './IntroSection';
import { createDocNode } from '~/__mocks__/utils';


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

