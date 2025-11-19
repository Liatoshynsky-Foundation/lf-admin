import { fireEvent, render, screen } from '@testing-library/react';

import { Header } from './Header';

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

describe('Header', () => {
  const defaultProps = {
    title: 'Про нас',
    onPreview: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    isSaving: false,
    onLanguageChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title and description', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Про нас')).toBeInTheDocument();
    expect(screen.getByText('Редагуйте та змінюйте вміст сторінки “Про нас”.')).toBeInTheDocument();
  });

  it('should call onPreview when "Попередній перегляд" button is clicked', () => {
    render(<Header {...defaultProps} />);
    const previewButton = screen.getByRole('button', { name: /Попередній перегляд/i });
    fireEvent.click(previewButton);
    expect(defaultProps.onPreview).toHaveBeenCalledTimes(1);
  });

  it('should call onSave when "Зберегти" button is clicked', () => {
    render(<Header {...defaultProps} />);
    const saveButton = screen.getByRole('button', { name: /Зберегти/i });
    fireEvent.click(saveButton);
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('should disable "Зберегти" button when isSaving is true', () => {
    render(<Header {...defaultProps} isSaving={true} />);
    const saveButton = screen.getByRole('button', { name: /Зберегти/i });
    expect(saveButton).toBeDisabled();
  });

  it('should render "Скасувати зміни" button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Скасувати зміни/i })).toBeInTheDocument();
  });

  it('should call onLanguageChange when LanguageSwitcher is used', () => {
    render(<Header {...defaultProps} />);
    const switcher = screen.getByTestId('language-switcher');
    fireEvent.click(switcher);
    expect(defaultProps.onLanguageChange).toHaveBeenCalledWith('en');
  });
});
