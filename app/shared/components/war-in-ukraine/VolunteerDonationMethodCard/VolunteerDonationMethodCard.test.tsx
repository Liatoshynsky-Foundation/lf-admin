import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { VolunteerDonationMethodCard, VolunteerPaymentMethodData } from './VolunteerDonationMethodCard';

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ title, value, onChange }: any) => (
    <div data-testid={`field-${title}`}>
      <input
        aria-label={title}
        value={value || ''}
        onChange={(e) => onChange(e)}
        data-testid={`input-${title}`}
      />
      <button
        type="button"
        data-testid={`string-btn-${title}`}
        onClick={() => onChange('Direct String Value')}
      >
        Pass String
      </button>
      <button
        type="button"
        data-testid={`empty-btn-${title}`}
        onClick={() => onChange({ target: { value: '' } })}
      >
        Pass Empty
      </button>
    </div>
  )
}));

describe('VolunteerDonationMethodCard', () => {
  const mockMethod: VolunteerPaymentMethodData = {
    id: '1',
    label: { uk: 'Карта УК', en: 'Card EN' },
    value: 'UA0000000'
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders labels and values correctly for Ukrainian locale', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Назва методу (Карта, PayPal тощо)')).toHaveValue('Карта УК');
    expect(screen.getByLabelText('Реквізити (IBAN, номер, email)')).toHaveValue('UA0000000');
  });

  it('renders labels and values correctly for English locale', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="en"
        onChangeMethod={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Назва методу (Карта, PayPal тощо)')).toHaveValue('Card EN');
    expect(screen.getByLabelText('Реквізити (IBAN, номер, email)')).toHaveValue('UA0000000');
  });

  it('handles missing label fields safely with default fallbacks', () => {
    const incompleteMethod: VolunteerPaymentMethodData = {
      id: '2',
      label: {} as any,
      value: ''
    };

    render(
      <VolunteerDonationMethodCard
        method={incompleteMethod}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Назва методу (Карта, PayPal тощо)')).toHaveValue('');
  });

  it('updates label using ChangeEvent (input change branch)', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Назва методу (Карта, PayPal тощо)');
    fireEvent.change(input, { target: { value: 'Нова Карта' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMethod,
      label: {
        uk: 'Нова Карта',
        en: 'Card EN'
      }
    });
  });

  it('updates label using direct string argument (typeof e === "string" branch)', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="en"
        onChangeMethod={mockOnChange}
      />
    );

    const btn = screen.getByTestId('string-btn-Назва методу (Карта, PayPal тощо)');
    fireEvent.click(btn);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMethod,
      label: {
        uk: 'Карта УК',
        en: 'Direct String Value'
      }
    });
  });

  it('falls back to empty strings when updating label for a method with no existing label object', () => {
    const methodWithoutLabel: VolunteerPaymentMethodData = {
      id: '3',
      label: undefined as any,
      value: 'UA5555555'
    };

    render(
      <VolunteerDonationMethodCard
        method={methodWithoutLabel}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    const btn = screen.getByTestId('string-btn-Назва методу (Карта, PayPal тощо)');
    fireEvent.click(btn);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...methodWithoutLabel,
      label: {
        uk: 'Direct String Value',
        en: ''
      }
    });
  });

  it('falls back to an empty string when the label change event carries no value', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    fireEvent.click(screen.getByTestId('empty-btn-Назва методу (Карта, PayPal тощо)'));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMethod,
      label: {
        uk: '',
        en: 'Card EN'
      }
    });
  });

  it('updates value using ChangeEvent (input change branch)', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Реквізити (IBAN, номер, email)');
    fireEvent.change(input, { target: { value: 'UA9999999' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMethod,
      value: 'UA9999999'
    });
  });

  it('updates value using direct string argument (typeof e === "string" branch)', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    const btn = screen.getByTestId('string-btn-Реквізити (IBAN, номер, email)');
    fireEvent.click(btn);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMethod,
      value: 'Direct String Value'
    });
  });

  it('falls back to an empty string when the value change event carries no value', () => {
    render(
      <VolunteerDonationMethodCard
        method={mockMethod}
        currentLocale="uk"
        onChangeMethod={mockOnChange}
      />
    );

    fireEvent.click(screen.getByTestId('empty-btn-Реквізити (IBAN, номер, email)'));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMethod,
      value: ''
    });
  });
});
