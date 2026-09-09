'use client';

import { Box } from '@mui/material';

import { ContentSectionHeader } from '../../../../shared/components/content-section-header/ContentSectionHeader';
import { styles } from './ContactInformationBlock.styles';
import type { ContactInformation, ContactsLocale } from '~/constants/contacts';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { mergeLocalizedValue } from '~/lib/utils/mergeLocalizedValue';

type ContactInformationField = keyof ContactInformation;

type ContactInformationBlockProps = Readonly<{
  data: ContactInformation;
  locale: ContactsLocale;
  onChange: (data: ContactInformation) => void;
  errors?: Record<string, string>;
  onFieldChange?: (field: ContactInformationField, locale?: ContactsLocale) => void;
  onFieldBlur?: (field: ContactInformationField, locale?: ContactsLocale) => void;
}>;

export const ContactInformationBlock = ({
  data,
  locale,
  onChange,
  errors,
  onFieldChange,
  onFieldBlur
}: ContactInformationBlockProps) => {
  const updateLocalizedField = (field: 'foundationName' | 'address', value: string) => {
    onChange({ ...data, [field]: mergeLocalizedValue(data[field], locale, value) });
    onFieldChange?.(field, locale);
  };

  const updateField = (field: 'phone' | 'email', value: string) => {
    onChange({ ...data, [field]: value });
    onFieldChange?.(field);
  };

  return (
    <Box sx={styles.container}>
      <ContentSectionHeader title="Контактна інформація" />
      <Box sx={styles.fields}>
        <CustomTextField
          label="Назва"
          value={data.foundationName[locale]}
          onChange={(event) => updateLocalizedField('foundationName', event.target.value)}
          error={Boolean(errors?.[`foundationName.${locale}`])}
          helperText={errors?.[`foundationName.${locale}`]}
          onBlur={() => onFieldBlur?.('foundationName', locale)}
          required
          fullWidth
        />
        <CustomTextField
          label="Локація"
          value={data.address[locale]}
          onChange={(event) => updateLocalizedField('address', event.target.value)}
          error={Boolean(errors?.[`address.${locale}`])}
          helperText={errors?.[`address.${locale}`]}
          onBlur={() => onFieldBlur?.('address', locale)}
          required
          fullWidth
        />
        <CustomTextField
          label="Номер телефону"
          value={data.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          error={Boolean(errors?.phone)}
          helperText={errors?.phone}
          onBlur={() => onFieldBlur?.('phone')}
          required
          fullWidth
        />
        <CustomTextField
          type="email"
          label="Електронна адреса"
          value={data.email}
          onChange={(event) => updateField('email', event.target.value)}
          error={Boolean(errors?.email)}
          helperText={errors?.email}
          onBlur={() => onFieldBlur?.('email')}
          required
          fullWidth
        />
      </Box>
    </Box>
  );
};
