'use client';

import { Box, Typography } from '@mui/material';

import { ContentSectionHeader } from '../../../../shared/components/content-section-header/ContentSectionHeader';
import { styles } from './ContactInformationBlock.styles';
import type { ContactInformation, ContactsLocale } from '~/constants/contacts';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { PHONE_MASK, usePhoneInput } from '~/shared/hooks/use-phone-input/usePhoneInput';

type ContactInformationField = keyof ContactInformation;
const MAX_LOCALIZED_FIELD_LENGTH = 150;

type ContactInformationBlockProps = Readonly<{
  data: ContactInformation;
  onChange: (data: ContactInformation) => void;
  errors?: Record<string, string>;
  onFieldChange?: (field: ContactInformationField, locale?: ContactsLocale) => void;
  onFieldBlur?: (field: ContactInformationField, locale?: ContactsLocale) => void;
}>;

export const ContactInformationBlock = ({
  data,
  onChange,
  errors,
  onFieldChange,
  onFieldBlur
}: ContactInformationBlockProps) => {
  const { formatPhoneNumber } = usePhoneInput();

  const updateLocalizedString = (field: 'foundationName' | 'address', locale: ContactsLocale, value: string) => {
    onChange({
      ...data,
      [field]: {
        ...data[field],
        [locale]: value.slice(0, MAX_LOCALIZED_FIELD_LENGTH)
      }
    });
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
        {(
          [
            {
              field: 'foundationName',
              locale: 'uk',
              label: 'Назва організації (українською)',
              placeholder: 'Введіть назву організації українською'
            },
            {
              field: 'foundationName',
              locale: 'en',
              label: 'Назва організації (англійською)',
              placeholder: 'Введіть назву організації англійською'
            },
            {
              field: 'address',
              locale: 'uk',
              label: 'Адреса організації (українською)',
              placeholder: 'Введіть адресу організації українською'
            },
            {
              field: 'address',
              locale: 'en',
              label: 'Адреса організації (англійською)',
              placeholder: 'Введіть адресу організації англійською'
            }
          ] as const
        ).map(({ field, locale, label, placeholder }) => {
          const value = data[field][locale];
          const error = errors?.[`${field}.${locale}`];

          return (
            <Box key={`${field}.${locale}`} sx={styles.localizedField}>
              <CustomTextField
                label={label}
                value={value}
                placeholder={placeholder}
                onChange={(event) => updateLocalizedString(field, locale, event.target.value)}
                error={Boolean(error)}
                helperText={error}
                onBlur={() => onFieldBlur?.(field, locale)}
                slotProps={{ htmlInput: { maxLength: MAX_LOCALIZED_FIELD_LENGTH } }}
                fullWidth
              />
              <Typography variant="caption" sx={styles.counter}>
                {value.length}/{MAX_LOCALIZED_FIELD_LENGTH}
              </Typography>
            </Box>
          );
        })}
        <Box sx={styles.phoneField}>
          <CustomTextField
            label="Основний номер телефону"
            value={formatPhoneNumber(data.phone)}
            placeholder={PHONE_MASK}
            onChange={(event) => updateField('phone', formatPhoneNumber(event.target.value))}
            error={Boolean(errors?.phone)}
            helperText={errors?.phone}
            onBlur={() => onFieldBlur?.('phone')}
            fullWidth
          />
        </Box>
        <Box sx={styles.fullWidthField}>
          <CustomTextField
            type="email"
            label="Основна електронна адреса"
            value={data.email}
            placeholder="Наприклад: name@example.org"
            onChange={(event) => updateField('email', event.target.value)}
            error={Boolean(errors?.email)}
            helperText={errors?.email}
            onBlur={() => onFieldBlur?.('email')}
            fullWidth
          />
        </Box>
      </Box>
    </Box>
  );
};
