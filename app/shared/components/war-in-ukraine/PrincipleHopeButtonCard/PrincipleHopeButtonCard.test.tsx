import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ClickableButtonData } from '../ConfigurableButtonList/ConfigurableButtonList';
import { PrincipleHopeButtonCard } from './PrincipleHopeButtonCard';

jest.mock('./PrincipleHopeButtonCard.styles', () => ({
  styles: {
    divider: {}
  }
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ title, value, onChange }: any) => (
    <div data-testid={`textfield-${title}`}>
      <label>{title}</label>
      <input
        aria-label={title}
        value={value || ''}
        onChange={(e) => onChange(e)}
      />
      <button
        type="button"
        data-testid={`direct-string-btn-${title}`}
        onClick={() => onChange('Пряме значення')}
      >
        Pass String
      </button>
    </div>
  )
}));

describe('PrincipleHopeButtonCard', () => {
  const mockButton: ClickableButtonData = {
    id: 'btn-1',
    shortText: { uk: 'Короткий УК', en: 'Short EN' },
    fullText: { uk: 'Повний УК', en: 'Full EN' },
    link: 'https://example.com'
  };

  const mockOnChangeButton = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all text fields and link with correct values for Ukrainian locale', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="uk"
        onChangeButton={mockOnChangeButton}
      />
    );

    expect(screen.getByLabelText('Короткий текст кнопки') as HTMLInputElement).toHaveValue('Короткий УК');
    expect(screen.getByLabelText('Повний текст кнопки') as HTMLInputElement).toHaveValue('Повний УК');
    expect(screen.getByLabelText('Посилання (URL)') as HTMLInputElement).toHaveValue('https://example.com');
  });

  it('renders all text fields and link with correct values for English locale', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="en"
        onChangeButton={mockOnChangeButton}
      />
    );

    expect(screen.getByLabelText('Короткий текст кнопки') as HTMLInputElement).toHaveValue('Short EN');
    expect(screen.getByLabelText('Повний текст кнопки') as HTMLInputElement).toHaveValue('Full EN');
    expect(screen.getByLabelText('Посилання (URL)') as HTMLInputElement).toHaveValue('https://example.com');
  });

  it('renders with empty values when shortText/fullText/link are missing', () => {
    const bareButton: ClickableButtonData = {
      id: 'btn-2',
      shortText: {} as any,
      fullText: {} as any,
      link: ''
    };

    render(
      <PrincipleHopeButtonCard
        button={bareButton}
        currentLocale="uk"
        onChangeButton={mockOnChangeButton}
      />
    );

    expect(screen.getByLabelText('Короткий текст кнопки') as HTMLInputElement).toHaveValue('');
    expect(screen.getByLabelText('Повний текст кнопки') as HTMLInputElement).toHaveValue('');
    expect(screen.getByLabelText('Посилання (URL)') as HTMLInputElement).toHaveValue('');
  });

  it('calls onChangeButton with updated shortText for current locale (event branch)', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="uk"
        onChangeButton={mockOnChangeButton}
      />
    );

    const input = screen.getByLabelText('Короткий текст кнопки');
    fireEvent.change(input, { target: { value: 'Новий короткий УК' } });

    expect(mockOnChangeButton).toHaveBeenCalledTimes(1);
    expect(mockOnChangeButton).toHaveBeenCalledWith({
      ...mockButton,
      shortText: {
        uk: 'Новий короткий УК',
        en: 'Short EN'
      }
    });
  });

  it('calls onChangeButton with updated shortText passed directly as a string', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="en"
        onChangeButton={mockOnChangeButton}
      />
    );

    fireEvent.click(screen.getByTestId('direct-string-btn-Короткий текст кнопки'));

    expect(mockOnChangeButton).toHaveBeenCalledWith({
      ...mockButton,
      shortText: {
        uk: 'Короткий УК',
        en: 'Пряме значення'
      }
    });
  });

  it('calls onChangeButton with updated fullText for current locale (event branch)', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="en"
        onChangeButton={mockOnChangeButton}
      />
    );

    const input = screen.getByLabelText('Повний текст кнопки');
    fireEvent.change(input, { target: { value: 'New Full EN' } });

    expect(mockOnChangeButton).toHaveBeenCalledTimes(1);
    expect(mockOnChangeButton).toHaveBeenCalledWith({
      ...mockButton,
      fullText: {
        uk: 'Повний УК',
        en: 'New Full EN'
      }
    });
  });

  it('calls onChangeButton with updated fullText passed directly as a string', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="uk"
        onChangeButton={mockOnChangeButton}
      />
    );

    fireEvent.click(screen.getByTestId('direct-string-btn-Повний текст кнопки'));

    expect(mockOnChangeButton).toHaveBeenCalledWith({
      ...mockButton,
      fullText: {
        uk: 'Пряме значення',
        en: 'Full EN'
      }
    });
  });

  it('falls back to empty strings when updating shortText/fullText for a button with no existing localized values', () => {
    const bareButton: ClickableButtonData = {
      id: 'btn-3',
      shortText: {} as any,
      fullText: {} as any,
      link: ''
    };

    render(
      <PrincipleHopeButtonCard
        button={bareButton}
        currentLocale="uk"
        onChangeButton={mockOnChangeButton}
      />
    );

    fireEvent.click(screen.getByTestId('direct-string-btn-Короткий текст кнопки'));

    expect(mockOnChangeButton).toHaveBeenCalledWith({
      ...bareButton,
      shortText: {
        uk: 'Пряме значення',
        en: ''
      }
    });
  });

  it('calls onChangeButton with updated link when link changes (event branch)', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="uk"
        onChangeButton={mockOnChangeButton}
      />
    );

    const input = screen.getByLabelText('Посилання (URL)');
    fireEvent.change(input, { target: { value: 'https://new-link.com' } });

    expect(mockOnChangeButton).toHaveBeenCalledTimes(1);
    expect(mockOnChangeButton).toHaveBeenCalledWith({
      ...mockButton,
      link: 'https://new-link.com'
    });
  });

  it('calls onChangeButton with updated link passed directly as a string', () => {
    render(
      <PrincipleHopeButtonCard
        button={mockButton}
        currentLocale="uk"
        onChangeButton={mockOnChangeButton}
      />
    );

    fireEvent.click(screen.getByTestId('direct-string-btn-Посилання (URL)'));

    expect(mockOnChangeButton).toHaveBeenCalledWith({
      ...mockButton,
      link: 'Пряме значення'
    });
  });
});
