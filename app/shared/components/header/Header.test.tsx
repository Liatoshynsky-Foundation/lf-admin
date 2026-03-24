import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Header } from './Header';

type HeaderProps = {
  title: string;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
};

const mockLanguageChange = jest.fn();

jest.mock('../language-switcher/LanguageSwitcher', () => ({
  __esModule: true,
  default: () => (
    <button
      type="button"
      data-testid="language-switcher"
      onClick={mockLanguageChange}
    >
      Language Switcher
    </button>
  )
}));

jest.mock('../design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}));

jest.mock('~/public/icons/externalLink.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="external-link" />
}));

describe('Header', () => {
  const defaultProps: HeaderProps = {
    title: 'Про нас',
    onPreview: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    isSaving: false
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
    const cancelButton = screen.getByRole('button', { name: /Скасувати зміни/i });
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onLanguageChange when LanguageSwitcher is used', () => {
    render(<Header {...defaultProps} />);
    const switcher = screen.getByTestId('language-switcher');
    fireEvent.click(switcher);
    expect(mockLanguageChange).toHaveBeenCalledTimes(1);
  });

  it('should render LanguageSwitcher component', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });
});
