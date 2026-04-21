import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { SeoCanonicalUrlField } from './SeoCanonicalUrlField';

jest.mock('@mui/material', () => ({
  TextField: ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText
  }: {
    label: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onBlur: () => void;
    error: boolean;
    helperText: string;
  }) => (
    <div>
      <label htmlFor="field">{label}</label>
      <input id="field" value={value} onChange={onChange} onBlur={onBlur} aria-invalid={error} />
      {helperText && <span data-testid="helper-text">{helperText}</span>}
    </div>
  )
}));

jest.mock('../SeoMetadataForm.styles', () => ({ styles: { textField: {} } }));

const baseProps = {
  value: '',
  onChange: jest.fn(),
  onBlur: jest.fn()
};

describe('SeoCanonicalUrlField', () => {
  it('renders default label when label prop is not provided', () => {
    render(<SeoCanonicalUrlField {...baseProps} />);
    expect(screen.getByText('Canonical URL')).toBeInTheDocument();
  });

  it('renders custom label when label prop is provided', () => {
    render(<SeoCanonicalUrlField {...baseProps} label="My URL" />);
    expect(screen.getByText('My URL')).toBeInTheDocument();
  });

  it('renders the given value', () => {
    render(<SeoCanonicalUrlField {...baseProps} value="https://example.com" />);
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com');
  });

  it('calls onChange with input value on change', () => {
    const onChange = jest.fn();
    render(<SeoCanonicalUrlField {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'https://new.com' } });
    expect(onChange).toHaveBeenCalledWith('https://new.com');
  });

  it('calls onBlur when field loses focus', () => {
    const onBlur = jest.fn();
    render(<SeoCanonicalUrlField {...baseProps} onBlur={onBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['порожнє значення після blur — показує помилку обовʼязкового поля', '', true, false, 'Обовʼязкове поле'],
    ['некоректний URL після blur — показує помилку формату', 'not-a-url', true, false, 'Некоректний URL'],
    ['валідний URL після blur — помилки немає', 'https://example.com', true, false, null],
    ['порожнє значення без blur — помилки немає', '', false, false, null]
  ] as const)('%s', (_desc, value, doBlur, _unused, expectedHelperText) => {
    render(<SeoCanonicalUrlField {...baseProps} value={value} />);
    if (doBlur) {
      fireEvent.blur(screen.getByRole('textbox'));
    }
    const expectedInvalid = Boolean(expectedHelperText);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', String(expectedInvalid));
    if (expectedHelperText) {
      expect(screen.getByTestId('helper-text')).toHaveTextContent(expectedHelperText);
    } else {
      expect(screen.queryByTestId('helper-text')).not.toBeInTheDocument();
    }
  });
});
