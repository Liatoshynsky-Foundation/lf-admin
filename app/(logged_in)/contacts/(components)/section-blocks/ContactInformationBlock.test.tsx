import { fireEvent, render, screen } from '@testing-library/react';

import { CONTACT_INFORMATION, CONTACT_LOCALES } from '../../__mocks__/contacts';
import { ContactInformationBlock } from './ContactInformationBlock';

const UPDATED_CONTACT_NAME = 'Оновлена назва';
const UPDATED_CONTACT_LOCATION = 'Львів';
const UPDATED_PHONE = '+380 111';
const UPDATED_EMAIL = 'new@example.com';

describe('ContactInformationBlock', () => {
  it('renders Ukrainian localized values', () => {
    render(<ContactInformationBlock data={CONTACT_INFORMATION} locale={CONTACT_LOCALES.uk} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.name.uk)).toBeInTheDocument();
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.location.uk)).toBeInTheDocument();
  });

  it('renders English localized values', () => {
    render(<ContactInformationBlock data={CONTACT_INFORMATION} locale={CONTACT_LOCALES.en} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.name.en)).toBeInTheDocument();
    expect(screen.getByDisplayValue(CONTACT_INFORMATION.location.en)).toBeInTheDocument();
  });

  it('updates localized and plain fields', () => {
    const onChange = jest.fn();
    render(<ContactInformationBlock data={CONTACT_INFORMATION} locale={CONTACT_LOCALES.uk} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue(CONTACT_INFORMATION.name.uk), {
      target: { value: UPDATED_CONTACT_NAME }
    });
    fireEvent.change(screen.getByDisplayValue(CONTACT_INFORMATION.location.uk), {
      target: { value: UPDATED_CONTACT_LOCATION }
    });
    fireEvent.change(screen.getByDisplayValue(CONTACT_INFORMATION.phone), { target: { value: UPDATED_PHONE } });
    fireEvent.change(screen.getByDisplayValue(CONTACT_INFORMATION.email), { target: { value: UPDATED_EMAIL } });

    expect(onChange).toHaveBeenNthCalledWith(1, {
      ...CONTACT_INFORMATION,
      name: { ...CONTACT_INFORMATION.name, uk: UPDATED_CONTACT_NAME }
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      ...CONTACT_INFORMATION,
      location: { ...CONTACT_INFORMATION.location, uk: UPDATED_CONTACT_LOCATION }
    });
    expect(onChange).toHaveBeenNthCalledWith(3, { ...CONTACT_INFORMATION, phone: UPDATED_PHONE });
    expect(onChange).toHaveBeenNthCalledWith(4, { ...CONTACT_INFORMATION, email: UPDATED_EMAIL });
  });
});
