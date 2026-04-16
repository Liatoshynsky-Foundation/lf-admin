import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { SeoBaseFields } from './SeoBaseFields';

jest.mock('@mui/material', () => ({
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TextField: ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    required,
    multiline
  }: {
    label: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onBlur: () => void;
    error: boolean;
    helperText: string;
    required?: boolean;
    multiline?: boolean;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error}
        aria-required={required}
        data-multiline={multiline}
      />
      {helperText && <span data-testid={`helper-${label}`}>{helperText}</span>}
    </div>
  )
}));

jest.mock('../SeoMetadataForm.styles', () => ({ styles: { formFields: {}, textField: {} } }));

const baseValue = { title: 'My Title', description: 'My Desc', keywords: 'kw' };

const fields = [
  ['title', 'Meta title'],
  ['description', 'Meta description'],
  ['keywords', 'Meta keywords']
] as const;
const baseProps = {
  value: baseValue,
  errors: {},
  touched: {},
  onFieldChange: jest.fn(),
  onBlur: jest.fn()
};

describe('SeoBaseFields', () => {
  it('renders all three fields with default labels and correct values', () => {
    render(<SeoBaseFields {...baseProps} />);
    expect(screen.getByLabelText('Meta title')).toHaveValue('My Title');
    expect(screen.getByLabelText('Meta description')).toHaveValue('My Desc');
    expect(screen.getByLabelText('Meta keywords')).toHaveValue('kw');
  });

  it('uses custom labels when provided', () => {
    render(
      <SeoBaseFields
        {...baseProps}
        labels={{ metaTitle: 'Custom Title', metaDescription: 'Custom Desc', metaKeywords: 'Custom Keywords' }}
      />
    );
    expect(screen.getByLabelText('Custom Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom Desc')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom Keywords')).toBeInTheDocument();
  });

  it('falls back to empty string when field values are empty', () => {
    render(<SeoBaseFields {...baseProps} value={{ title: '', description: '', keywords: '' }} />);
    expect(screen.getByLabelText('Meta title')).toHaveValue('');
    expect(screen.getByLabelText('Meta description')).toHaveValue('');
    expect(screen.getByLabelText('Meta keywords')).toHaveValue('');
  });

  test.each([
    ['title', 'Meta title', 'New title'],
    ['description', 'Meta description', 'New desc'],
    ['keywords', 'Meta keywords', 'new kw']
  ] as const)('calls onFieldChange with key "%s" and new value', (fieldKey, label, newValue) => {
    const onFieldChange = jest.fn();
    render(<SeoBaseFields {...baseProps} onFieldChange={onFieldChange} />);
    fireEvent.change(screen.getByLabelText(label), { target: { value: newValue } });
    expect(onFieldChange).toHaveBeenCalledWith(fieldKey, newValue);
  });

  test.each(fields)('calls onBlur with key "%s"', (fieldKey, label) => {
    const onBlur = jest.fn();
    render(<SeoBaseFields {...baseProps} onBlur={onBlur} />);
    fireEvent.blur(screen.getByLabelText(label));
    expect(onBlur).toHaveBeenCalledWith(fieldKey);
  });

  test.each(fields)('shows error and helperText for "%s" only when both error and touched', (fieldKey, label) => {
    const { rerender } = render(
      <SeoBaseFields {...baseProps} errors={{ [fieldKey]: 'Required' }} touched={{ [fieldKey]: true }} />
    );
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId(`helper-${label}`)).toHaveTextContent('Required');

    rerender(<SeoBaseFields {...baseProps} errors={{ [fieldKey]: 'Required' }} touched={{}} />);
    expect(screen.queryByTestId(`helper-${label}`)).not.toBeInTheDocument();
  });

  it('marks title and description as required and sets multiline on description and keywords', () => {
    render(<SeoBaseFields {...baseProps} />);
    expect(screen.getByLabelText('Meta title')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('Meta description')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('Meta description')).toHaveAttribute('data-multiline', 'true');
    expect(screen.getByLabelText('Meta keywords')).not.toHaveAttribute('aria-required');
    expect(screen.getByLabelText('Meta keywords')).toHaveAttribute('data-multiline', 'true');
    expect(screen.getByLabelText('Meta title')).not.toHaveAttribute('data-multiline');
  });
});
