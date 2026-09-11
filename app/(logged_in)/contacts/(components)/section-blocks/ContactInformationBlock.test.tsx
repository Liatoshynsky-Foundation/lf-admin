import { fireEvent, render, screen } from '@testing-library/react';

import { CONTACT_INFORMATION, CONTACT_LOCALES } from '../../__mocks__/contacts';
import { ContactInformationBlock } from './ContactInformationBlock';

const UPDATED_CONTACT_NAME = 'Оновлена назва';
const UPDATED_CONTACT_LOCATION = 'Львів';
const UPDATED_PHONE = '0441234567';
const FORMATTED_UPDATED_PHONE = '+38 044 123 4567';
const UPDATED_EMAIL = 'new@example.com';

describe('ContactInformationBlock', () => {
  it('renders Ukrainian localized values', () => {
    render(<ContactInformationBlock data={CONTACT_INFORMATION} locale={CONTACT_LOCALES.uk} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.foundationName.uk)).toBeInTheDocument();
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.address.uk)).toBeInTheDocument();
  });

  it('renders English localized values', () => {
    render(<ContactInformationBlock data={CONTACT_INFORMATION} locale={CONTACT_LOCALES.en} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.foundationName.en)).toBeInTheDocument();
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.address.en)).toBeInTheDocument();
  });

  it('updates localized and plain fields', () => {
    const onChange = jest.fn();
    const onFieldChange = jest.fn();
    const onFieldBlur = jest.fn();
    render(
      <ContactInformationBlock
        data={CONTACT_INFORMATION}
        locale={CONTACT_LOCALES.uk}
        onChange={onChange}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />
    );

    fireEvent.change(screen.getByDisplayValue(CONTACT_INFORMATION.foundationName.uk), {
      target: { value: UPDATED_CONTACT_NAME }
    });
    fireEvent.change(screen.getByDisplayValue(CONTACT_INFORMATION.address.uk), {
      target: { value: UPDATED_CONTACT_LOCATION }
    });
    const phoneInput = screen.getByDisplayValue(CONTACT_INFORMATION.phone);
    fireEvent.change(phoneInput, { target: { value: UPDATED_PHONE } });
    const emailInput = screen.getByDisplayValue(CONTACT_INFORMATION.email);
    fireEvent.change(emailInput, { target: { value: UPDATED_EMAIL } });
    fireEvent.blur(screen.getByDisplayValue(CONTACT_INFORMATION.foundationName.uk));
    fireEvent.blur(screen.getByDisplayValue(CONTACT_INFORMATION.address.uk));
    fireEvent.blur(phoneInput);
    fireEvent.blur(emailInput);

    expect(onChange).toHaveBeenNthCalledWith(1, {
      ...CONTACT_INFORMATION,
      foundationName: { ...CONTACT_INFORMATION.foundationName, uk: UPDATED_CONTACT_NAME }
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      ...CONTACT_INFORMATION,
      address: { ...CONTACT_INFORMATION.address, uk: UPDATED_CONTACT_LOCATION }
    });
    expect(onChange).toHaveBeenNthCalledWith(3, { ...CONTACT_INFORMATION, phone: FORMATTED_UPDATED_PHONE });
    expect(onChange).toHaveBeenNthCalledWith(4, { ...CONTACT_INFORMATION, email: UPDATED_EMAIL });
    expect(onFieldChange).toHaveBeenNthCalledWith(1, 'foundationName', CONTACT_LOCALES.uk);
    expect(onFieldChange).toHaveBeenNthCalledWith(2, 'address', CONTACT_LOCALES.uk);
    expect(onFieldChange).toHaveBeenNthCalledWith(3, 'phone');
    expect(onFieldChange).toHaveBeenNthCalledWith(4, 'email');
    expect(onFieldBlur).toHaveBeenNthCalledWith(1, 'foundationName', CONTACT_LOCALES.uk);
    expect(onFieldBlur).toHaveBeenNthCalledWith(2, 'address', CONTACT_LOCALES.uk);
    expect(onFieldBlur).toHaveBeenNthCalledWith(3, 'phone');
    expect(onFieldBlur).toHaveBeenNthCalledWith(4, 'email');
  });
});
