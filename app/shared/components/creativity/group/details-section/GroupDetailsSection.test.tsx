import { fireEvent, render, screen } from '@testing-library/react';
import React, { ChangeEvent, FocusEvent, ReactNode } from 'react';

import { GroupDetailsSection } from './GroupDetailsSection';

type MockCollapsibleBlockProps = {
  children: ReactNode;
  title?: string;
  defaultExpanded?: boolean;
};

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
  select?: boolean;
  type?: string;
  required?: boolean;
  fullWidth?: boolean;
  inputProps?: Record<string, unknown>;
};

type MockDatePickerProps = {
  onChange: (value: { format: (fmt: string) => string } | null) => void;
  label?: string;
  slotProps?: any;
};

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: MockCollapsibleBlockProps) => <div data-testid="mock-collapsible-block">{children}</div>
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ label, value, onChange, onBlur, error, helperText, InputProps, inputProps}: MockCustomTextFieldProps) => (
    <div data-testid={`mock-field-wrapper-${label}`}>
      <label htmlFor={`input-${label}`}>{label}</label>
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
    dateAdditionalText: { uk: 'приблизно', en: 'approx.' }
  },
  derivedGenre: 'Соната',
  currentLanguage: 'UA',
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
    const propsEN = { ...defaultProps, currentLanguage: 'EN' };
    render(<GroupDetailsSection {...propsEN} />);

    expect(screen.getByTestId('mock-input-Назва групи')).toHaveValue('Quartet');
  });

  it('should call onChange with correct parameters when dateAdditionalText is changed', () => {
    render(<GroupDetailsSection {...defaultProps} />);

    const langInput = screen.getByTestId('mock-input-dateAdditionalText');
    fireEvent.change(langInput, { target: { value: 'новий текст' } });

    expect(mockOnChange).toHaveBeenCalledWith('dateAdditionalText', 'новий текст');
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
});
