'use client';

import { Box } from '@mui/material';

import { HeaderRow } from '../../(shared)/HeaderRow';
import type { ContactInformation, ContactsLocale } from '~/constants/contacts';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { mergeLocalizedValue } from '~/lib/utils/mergeLocalizedValue';

type ContactInformationBlockProps = Readonly<{
  data: ContactInformation;
  locale: ContactsLocale;
  onChange: (data: ContactInformation) => void;
}>;

export const ContactInformationBlock = ({ data, locale, onChange }: ContactInformationBlockProps) => {
  const updateField = (field: keyof ContactInformation, value: string) => {
    onChange({ ...data, [field]: mergeLocalizedValue(data[field], locale, value) });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <HeaderRow title="Контактна інформація" />
      <Box display="flex" flexDirection="column" gap={2}>
        <CustomTextField
          label="Назва"
          value={data.name[locale]}
          onChange={(event) => updateField('name', event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          label="Локація"
          value={data.location[locale]}
          onChange={(event) => updateField('location', event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          label="Номер телефону"
          value={data.phone[locale]}
          onChange={(event) => updateField('phone', event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          type="email"
          label="Електронна адреса"
          value={data.email[locale]}
          onChange={(event) => updateField('email', event.target.value)}
          fullWidth
        />
      </Box>
    </Box>
  );
};
