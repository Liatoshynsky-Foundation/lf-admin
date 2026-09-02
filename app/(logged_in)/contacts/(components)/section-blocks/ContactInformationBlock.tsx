'use client';

import { Box } from '@mui/material';

import { ContentSectionHeader } from '../../../../shared/components/content-section-header/ContentSectionHeader';
import { styles } from './ContactInformationBlock.styles';
import type { ContactInformation, ContactsLocale } from '~/constants/contacts';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { mergeLocalizedValue } from '~/lib/utils/mergeLocalizedValue';

type ContactInformationBlockProps = Readonly<{
  data: ContactInformation;
  locale: ContactsLocale;
  onChange: (data: ContactInformation) => void;
}>;

export const ContactInformationBlock = ({ data, locale, onChange }: ContactInformationBlockProps) => {
  const updateLocalizedField = (field: 'name' | 'location', value: string) => {
    onChange({ ...data, [field]: mergeLocalizedValue(data[field], locale, value) });
  };

  const updateField = (field: 'phone' | 'email', value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={styles.container}>
      <ContentSectionHeader title="Контактна інформація" />
      <Box sx={styles.fields}>
        <CustomTextField
          label="Назва"
          value={data.name[locale]}
          onChange={(event) => updateLocalizedField('name', event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          label="Локація"
          value={data.location[locale]}
          onChange={(event) => updateLocalizedField('location', event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          label="Номер телефону"
          value={data.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          required
          fullWidth
        />
        <CustomTextField
          type="email"
          label="Електронна адреса"
          value={data.email}
          onChange={(event) => updateField('email', event.target.value)}
          fullWidth
        />
      </Box>
    </Box>
  );
};
