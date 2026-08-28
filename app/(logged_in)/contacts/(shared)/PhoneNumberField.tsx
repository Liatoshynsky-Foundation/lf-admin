import { Box, Typography } from '@mui/material';
import { Phone } from 'lucide-react';

import { SelectTextField } from './SelectTextField';

type PhoneNumberFieldProps = Readonly<{
  countryCode: string;
  countryCodes: readonly string[];
  phoneNumber: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  phoneNumberLabel?: string;
  countryCodeLabel?: string;
  required?: boolean;
}>;

export const PhoneNumberField = ({
  countryCode,
  countryCodes,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  phoneNumberLabel = 'Номер телефону',
  countryCodeLabel = 'Код країни',
  required = false
}: PhoneNumberFieldProps) => {
  return (
    <SelectTextField
      options={countryCodes}
      selectValue={countryCode}
      textValue={phoneNumber}
      getOptionValue={(code) => code}
      getOptionLabel={(code) => code}
      renderSelectedValue={(value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Phone size={20} strokeWidth={1.5} aria-hidden />
          <Typography variant="body2">{value}</Typography>
        </Box>
      )}
      selectAriaLabel={countryCodeLabel}
      textFieldLabel={phoneNumberLabel}
      onSelectChange={onCountryCodeChange}
      onTextChange={onPhoneNumberChange}
      required={required}
    />
  );
};
