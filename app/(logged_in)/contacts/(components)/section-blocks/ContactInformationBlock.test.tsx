import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';

import { CONTACT_INFORMATION } from '../../__mocks__/contacts';
import { ContactInformationBlock } from './ContactInformationBlock';

const UPDATED_CONTACT_NAME = 'Оновлена назва';
const UPDATED_CONTACT_LOCATION = 'Львів';
const UPDATED_PHONE_INPUT = '067 123 4567';
const UPDATED_PHONE = '+38 067 123 4567';
const UPDATED_EMAIL = 'new@example.com';

const StatefulContactInformationBlock = () => {
  const [data, setData] = useState(CONTACT_INFORMATION);

  return <ContactInformationBlock data={data} onChange={setData} />;
};

describe('ContactInformationBlock', () => {
  it('renders all localized and shared fields with counters', () => {
    render(<ContactInformationBlock data={CONTACT_INFORMATION} onChange={jest.fn()} />);

    expect(screen.getByLabelText('Назва організації (українською)')).toHaveValue(CONTACT_INFORMATION.foundationName.uk);
    expect(screen.getByLabelText('Назва організації (англійською)')).toHaveValue(CONTACT_INFORMATION.foundationName.en);
    expect(screen.getByLabelText('Адреса організації (українською)')).toHaveValue(CONTACT_INFORMATION.address.uk);
    expect(screen.getByLabelText('Адреса організації (англійською)')).toHaveValue(CONTACT_INFORMATION.address.en);
    expect(screen.getByLabelText('Основний номер телефону')).toHaveValue(CONTACT_INFORMATION.phone);
    expect(screen.getByPlaceholderText('+38 ___ ___ ____')).toBeInTheDocument();
    expect(screen.getByLabelText('Основна електронна адреса')).toHaveValue(CONTACT_INFORMATION.email);
    expect(screen.getAllByText(/\/150$/)).toHaveLength(4);
  });

  it('updates localized and shared values independently', () => {
    const onChange = jest.fn();
    const onFieldChange = jest.fn();
    const onFieldBlur = jest.fn();

    render(
      <ContactInformationBlock
        data={CONTACT_INFORMATION}
        onChange={onChange}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />
    );

    fireEvent.change(screen.getByLabelText('Назва організації (українською)'), {
      target: { value: UPDATED_CONTACT_NAME }
    });
    fireEvent.change(screen.getByLabelText('Адреса організації (українською)'), {
      target: { value: UPDATED_CONTACT_LOCATION }
    });
    fireEvent.change(screen.getByLabelText('Основний номер телефону'), {
      target: { value: UPDATED_PHONE_INPUT }
    });
    fireEvent.change(screen.getByLabelText('Основна електронна адреса'), {
      target: { value: UPDATED_EMAIL }
    });

    expect(onChange.mock.calls).toEqual([
      [{ ...CONTACT_INFORMATION, foundationName: { ...CONTACT_INFORMATION.foundationName, uk: UPDATED_CONTACT_NAME } }],
      [{ ...CONTACT_INFORMATION, address: { ...CONTACT_INFORMATION.address, uk: UPDATED_CONTACT_LOCATION } }],
      [{ ...CONTACT_INFORMATION, phone: UPDATED_PHONE }],
      [{ ...CONTACT_INFORMATION, email: UPDATED_EMAIL }]
    ]);

    fireEvent.blur(screen.getByLabelText('Назва організації (українською)'));
    fireEvent.blur(screen.getByLabelText('Адреса організації (українською)'));
    fireEvent.blur(screen.getByLabelText('Основний номер телефону'));
    fireEvent.blur(screen.getByLabelText('Основна електронна адреса'));

    expect(onFieldChange.mock.calls).toEqual([
      ['foundationName', 'uk'],
      ['address', 'uk'],
      ['phone'],
      ['email']
    ]);
    expect(onFieldBlur.mock.calls).toEqual([
      ['foundationName', 'uk'],
      ['address', 'uk'],
      ['phone'],
      ['email']
    ]);
  });

  it('truncates pasted text at 150 characters and updates the counter', () => {
    render(<StatefulContactInformationBlock />);
    const input = screen.getByLabelText('Назва організації (українською)');

    fireEvent.change(input, { target: { value: 'x'.repeat(151) } });

    expect(input).toHaveValue('x'.repeat(150));
    expect(screen.getByText('150/150')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByText('0/150')).toBeInTheDocument();
  });
});
