import { fireEvent, render, screen } from '@testing-library/react';
import React, { ChangeEvent, FocusEvent, ReactNode } from 'react';

import { GroupDetailsSection } from './GroupDetailsSection';
import { EditorLanguage } from '~/constants/publications';

type MockCustomTextFieldProps = {
  label: string;
  value?: unknown;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: ReactNode;
  InputProps?: {
    readOnly?: boolean;
    sx?: object;
  };
  SelectProps?: {
    onOpen?: () => void;
    onClose?: () => void;
    open?: boolean;
  };
  select?: boolean;
  type?: string;
  required?: boolean;
  fullWidth?: boolean;
  inputProps?: Record<string, unknown>;
};

type MockDatePickerProps = {
  onChange: (value: { format: (fmt: string) => string } | null) => void;
  label?: string;
  slotProps?: {
    textField?: {
      error?: boolean;
      helperText?: ReactNode;
      onBlur?: () => void;
      required?: boolean;
      sx?: object;
    };
  };
};

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    InputProps,
    inputProps,
    SelectProps
  }: MockCustomTextFieldProps) => (
    <div data-testid={`mock-field-wrapper-${label}`}>
      <label htmlFor={`input-${label}`}>{label}</label>

      {SelectProps?.onOpen && (
        <>
          <button
            data-testid={`trigger-open-${label}`}
            onClick={SelectProps.onOpen}
            data-is-open={String(SelectProps.open)}
          >
            Open Select
          </button>
          <button data-testid={`trigger-close-${label}`} onClick={SelectProps.onClose}>
            Close Select
          </button>
        </>
      )}

      <input
        id={`input-${label}`}
        data-testid={`mock-input-${label}`}
        value={(value as string) || ''}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={InputProps?.readOnly}
        {...inputProps}
      />
      {error && <span data-testid={`error-${label}`}>{helperText}</span>}
    </div>
  )
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ onChange, label, slotProps }: MockDatePickerProps) => {
    const isError = slotProps?.textField?.error;
    const helperText = slotProps?.textField?.helperText;
    return (
      <div data-testid={`mock-datepicker-${label}`}>
        <button data-testid={`trigger-date-change-${label}`} onClick={() => onChange({ format: () => '1922' })} />
        <button data-testid={`trigger-date-clear-${label}`} onClick={() => onChange(null)} />
        <button data-testid={`trigger-date-blur-${label}`} onClick={() => slotProps?.textField?.onBlur?.()} />
        {isError && <span data-testid={`error-${label}`}>{helperText}</span>}
      </div>
    );
  }
}));

const mockOnChange = jest.fn();

const defaultProps = {
  data: {
    titlePrefix: 'Op.',
    groupNumber: '42',
    additionalText: 'bis',
    groupTitle: { uk: 'Квартет', en: 'Quartet' },
    creationYear: '1922',
    endYear: '1924',
    dateAdditionalText: { uk: 'приблизно', en: 'approx.' },
    genre: { uk: 'Соната', en: 'Sonata' }
  },
  derivedGenre: 'Соната',
  currentLanguage: 'UA' as EditorLanguage,
  errors: {} as Record<string, string>,
  onChange: mockOnChange
};

describe('GroupDetailsSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all fields with correct initial values', () => {
    render(<GroupDetailsSection {...defaultProps} />);

    expect(screen.getByTestId('mock-input-Назва')).toHaveValue('Op.');
    expect(screen.getByTestId('mock-input-Номер')).toHaveValue('42');
    expect(screen.getByTestId('mock-input-additionalText-top')).toHaveValue('bis');
    expect(screen.getByTestId('mock-input-Назва групи')).toHaveValue('Квартет');
    expect(screen.getByTestId('mock-datepicker-Рік створення')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datepicker-Рік закінчення')).toBeInTheDocument();
    expect(screen.getByTestId('mock-input-dateAdditionalText')).toHaveValue('приблизно');
  });

  it('should switch groupTitle value when language changes to EN', () => {
    const propsEN = { ...defaultProps, currentLanguage: 'EN' as EditorLanguage };
    render(<GroupDetailsSection {...propsEN} />);

    expect(screen.getByTestId('mock-input-Назва групи')).toHaveValue('Quartet');
  });

  it('should call onChange with correct parameters when dateAdditionalText is changed', () => {
    render(<GroupDetailsSection {...defaultProps} />);

    const langInput = screen.getByTestId('mock-input-dateAdditionalText');
    fireEvent.change(langInput, { target: { value: 'новий текст' } });

    expect(mockOnChange).toHaveBeenCalledWith('dateAdditionalText', 'новий текст', true);
  });

  it('should format year and call onChange when dates are selected', () => {
    render(<GroupDetailsSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('trigger-date-change-Рік створення'));
    expect(mockOnChange).toHaveBeenCalledWith('creationYear', '1922');

    fireEvent.click(screen.getByTestId('trigger-date-change-Рік закінчення'));
    expect(mockOnChange).toHaveBeenCalledWith('endYear', '1922');
  });

  it('should call onChange with empty string when date is cleared', () => {
    render(<GroupDetailsSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('trigger-date-clear-Рік створення'));
    expect(mockOnChange).toHaveBeenCalledWith('creationYear', '');
  });

  it('should show validation error when groupNumber is negative', () => {
    const propsWithNegativeNumber = {
      ...defaultProps,
      data: { ...defaultProps.data, groupNumber: '-5' }
    };
    render(<GroupDetailsSection {...propsWithNegativeNumber} />);
    fireEvent.blur(screen.getByTestId('mock-input-Номер'));
    expect(screen.getByTestId('error-Номер')).toHaveTextContent('Значення не може бути від\'ємним');
  });

  it('should display validation error when required creation year is empty after blur', () => {
    const propsWithEmptyYear = {
      ...defaultProps,
      data: { ...defaultProps.data, creationYear: '' }
    };

    render(<GroupDetailsSection {...propsWithEmptyYear} />);

    expect(screen.queryByTestId('error-Рік створення')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('trigger-date-blur-Рік створення'));

    expect(screen.getByTestId('error-Рік створення')).toHaveTextContent('Обов’язкове поле');
  });

  it('should display external validation errors passed from props', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: {
        titlePrefix: 'Спеціальна помилка префіксу',
        creationYear: 'Заповніть рік'
      }
    };

    render(<GroupDetailsSection {...propsWithErrors} />);

    expect(screen.getByTestId('error-Назва')).toHaveTextContent('Спеціальна помилка префіксу');
    expect(screen.getByTestId('error-Рік створення')).toHaveTextContent('Заповніть рік');
  });

  it('should close prefix menu when window is scrolled', () => {
    render(<GroupDetailsSection {...defaultProps} />);
    const triggerBtn = screen.getByTestId('trigger-open-Назва');
    fireEvent.click(triggerBtn);

    expect(triggerBtn).toHaveAttribute('data-is-open', 'true');
    fireEvent.scroll(window);
    expect(triggerBtn).toHaveAttribute('data-is-open', 'false');
  });

  it('should show validation errors on blur for groupNumber and groupTitle fields', () => {
    const propsWithEmptyFields = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        groupNumber: '',
        groupTitle: { uk: '', en: '' }
      }
    };
    render(<GroupDetailsSection {...propsWithEmptyFields} />);

    fireEvent.blur(screen.getByTestId('mock-input-Номер'));
    expect(screen.getByTestId('error-Номер')).toHaveTextContent('Обов’язкове поле');

    fireEvent.blur(screen.getByTestId('mock-input-Назва групи'));
    expect(screen.getByTestId('error-Назва групи')).toHaveTextContent('Обов’язкове поле');
  });

  it('should call onChange with correct parameters for all text fields', () => {
    render(<GroupDetailsSection {...defaultProps} />);

    fireEvent.change(screen.getByTestId('mock-input-Номер'), { target: { value: '99' } });
    expect(mockOnChange).toHaveBeenCalledWith('groupNumber', '99');

    fireEvent.change(screen.getByTestId('mock-input-Назва'), { target: { value: 'Bo.' } });
    expect(mockOnChange).toHaveBeenCalledWith('titlePrefix', 'Bo.');

    fireEvent.change(screen.getByTestId('mock-input-additionalText-top'), {
      target: { value: 'новий додатковий текст' }
    });
    expect(mockOnChange).toHaveBeenCalledWith('additionalText', 'новий додатковий текст');

    fireEvent.change(screen.getByTestId('mock-input-Назва групи'), { target: { value: 'Новий Квартет' } });
    expect(mockOnChange).toHaveBeenCalledWith('groupTitle', 'Новий Квартет', true);
  });

  it('should handle SelectProps onClose for title prefix', () => {
    render(<GroupDetailsSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('trigger-open-Назва'));

    const closeBtn = screen.getByTestId('trigger-close-Назва');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
  });

  it('should handle onChange and display external errors for the Genre field', () => {
    const propsWithGenreError = {
      ...defaultProps,
      errors: { genre: 'Невірний жанр' }
    };
    render(<GroupDetailsSection {...propsWithGenreError} />);

    expect(screen.getByTestId('error-Жанр')).toHaveTextContent('Невірний жанр');
    const genreInput = screen.getByTestId('mock-input-Жанр');
    fireEvent.change(genreInput, { target: { value: 'Новий жанр' } });
    expect(mockOnChange).toHaveBeenCalledWith('genre', 'Новий жанр', true);
  });

  it('should cover all edge-case fallbacks and validation priorities (groupNumber prop error, prefix blur, empty dates/numbers)', () => {
    const edgeCaseProps = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        titlePrefix: '',
        groupNumber: undefined as unknown as string,
        endYear: ''
      },
      errors: {
        groupNumber: 'Зовнішня помилка номера'
      }
    };

    render(<GroupDetailsSection {...edgeCaseProps} />);

    expect(screen.getByTestId('error-Номер')).toHaveTextContent('Зовнішня помилка номера');
    expect(screen.getByTestId('mock-input-Номер')).toHaveValue('');

    const prefixInput = screen.getByTestId('mock-input-Назва');
    fireEvent.blur(prefixInput);
    expect(screen.getByTestId('error-Назва')).toHaveTextContent('Обов’язкове поле');
  });
});
