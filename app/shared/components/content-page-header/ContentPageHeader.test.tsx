import { render, screen } from '@testing-library/react';

import { ContentPageHeader } from './ContentPageHeader';

type HeaderProps = {
  title: string;
  onPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
  onLanguageChange: (lang: 'ua' | 'en') => void;
  children?: React.ReactNode;
};

jest.mock('../language-switcher/LanguageSwitcher', () => ({
  __esModule: true,
  default: ({ languageSwitcher }: { languageSwitcher: (lang: 'ua' | 'en') => void }) => (
    <button data-testid="language-switcher" onClick={() => languageSwitcher('en')}>
      Switch Language
    </button>
  )
}));

jest.mock('../design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, ...props }: HeaderProps) => <button {...props}>{children}</button>
}));

jest.mock('~/public/icons/externalLink.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="external-link" />
}));

describe('ContentPageHeader', () => {
  const defaultProps = {
    title: 'Про нас'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title and description', () => {
    render(<ContentPageHeader {...defaultProps} />);
    expect(screen.getByText('Про нас')).toBeInTheDocument();
  });
});
