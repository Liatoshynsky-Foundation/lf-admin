'use client';

import { Divider,Stack } from '@mui/material';
import React from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';
import { getEventValue } from '~/src/shared/utils/formHelpers';

export type VolunteerPaymentMethodData = {
  id: string | number;
  label: Record<'uk' | 'en', string>;
  value: string;
};

type VolunteerMethodCardProps = {
  method: VolunteerPaymentMethodData;
  currentLocale: 'uk' | 'en';
  onChangeMethod: (updatedMethod: VolunteerPaymentMethodData) => void;
};

export const VolunteerDonationMethodCard = ({ method, currentLocale, onChangeMethod }: VolunteerMethodCardProps) => {
  const handleLabelChange = (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const textValue = getEventValue(e);

    onChangeMethod({
      ...method,
      label: {
        uk: method.label?.uk || '',
        en: method.label?.en || '',
        [currentLocale]: textValue
      }
    });
  };

  const handleValueChange = (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const textValue = getEventValue(e);
    onChangeMethod({ ...method, value: textValue });
  };

  return (
    <Stack direction="column" gap={2} width="100%" mt={1}>
      <CustomTextField
        title="Назва методу (Карта, PayPal тощо)"
        label="Наприклад: Карта"
        value={method.label?.[currentLocale] || ''}
        onChange={handleLabelChange}
        fullWidth
      />

      <CustomTextField
        title="Реквізити (IBAN, номер, email)"
        label="Наприклад: UA0230..."
        value={method.value || ''}
        onChange={handleValueChange}
        fullWidth
      />

      <Divider sx={{ mt: 2, mb: 1 }} />
    </Stack>
  );
};