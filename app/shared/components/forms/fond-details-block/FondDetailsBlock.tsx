'use client';

import { Box, Divider, TextField, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { styles } from './FondDetailsBlock.styles';
import { CustomFormattingField } from '~/shared/components/custom-formatting-field/CustomFormattingField';
import { useStore } from '~/store';
import { LocalizedJSON, LocalizedString } from '~/types/common';

export interface FondDetailsValue {
  fondNumber: string;
  name: LocalizedString;
  documentCreationDate: string;
  chronologicalBoundaries: string;
  organizationForm: LocalizedString;
  description: LocalizedJSON;
  casesCount: number;
  descriptionsCount: number;
}

export type FondDetailsErrors = Partial<Record<keyof FondDetailsValue, string>>;

interface FondDetailsBlockProps {
  value: FondDetailsValue;
  onChange: (updater: (prev: FondDetailsValue) => FondDetailsValue) => void;
  errors: FondDetailsErrors;
  forceShowErrors?: boolean;
  mode?: 'create' | 'edit';
}

export default function FondDetailsBlock({
  value,
  onChange,
  errors,
  forceShowErrors,
}: Readonly<FondDetailsBlockProps>) {
  const currentLocale = useStore((state) => state.locale);

  const updateField = <Key extends keyof FondDetailsValue>(key: Key, fieldValue: FondDetailsValue[Key]): void => {
    onChange((prev) => ({ ...prev, [key]: fieldValue }));
  };

  const showError = (field: keyof FondDetailsValue) => forceShowErrors && Boolean(errors[field]);
  const getHelperText = (field: keyof FondDetailsValue) => (forceShowErrors ? errors[field] : undefined);
  const descriptionValue = value.description[currentLocale] as JSONContent;

  return (
    <Box sx={styles.container}>
      <Typography sx={styles.autoFillLabel}>Поля заповнюються автоматично</Typography>
      <Box sx={styles.countersRow}>
        <TextField disabled label="Кількість описів" value={value.descriptionsCount} sx={styles.counterField} />
        <TextField disabled label="Кількість справ" value={value.casesCount} sx={styles.counterField} />
      </Box>

      <Divider />

      <TextField
        label="Номер Фонду *"
        value={value.fondNumber}
        onChange={(event) => updateField('fondNumber', event.target.value)}
        error={showError('fondNumber')}
        helperText={getHelperText('fondNumber')}
        sx={styles.numberField}
        slotProps={{ htmlInput: { inputMode: 'numeric' } }}
      />

      <TextField
        label="Назва фонду *"
        value={value.name[currentLocale as 'uk' | 'en'] || ''}
        onChange={(event) => updateField('name', { ...value.name, [currentLocale]: event.target.value })}
        error={showError('name')}
        helperText={getHelperText('name')}
        sx={styles.fullWidthField}
        slotProps={{ htmlInput: { maxLength: 40 } }}
      />

      <Box sx={styles.fieldsRow}>
        <TextField
          label="Дата утворення документів *"
          value={value.documentCreationDate}
          onChange={(event) => updateField('documentCreationDate', event.target.value)}
          error={showError('documentCreationDate')}
          helperText={getHelperText('documentCreationDate')}
          sx={styles.halfWidthField}
          slotProps={{ htmlInput: { maxLength: 150 } }}
        />
        <TextField
          label="Хронологічні межі *"
          value={value.chronologicalBoundaries}
          onChange={(event) => updateField('chronologicalBoundaries', event.target.value)}
          error={showError('chronologicalBoundaries')}
          helperText={getHelperText('chronologicalBoundaries')}
          sx={styles.halfWidthField}
          slotProps={{ htmlInput: { maxLength: 150 } }}
        />
      </Box>

      <TextField
        label="Форма упорядкування:"
        value={value.organizationForm[currentLocale as 'uk' | 'en'] || ''}
        onChange={(event) =>
          updateField('organizationForm', { ...value.organizationForm, [currentLocale]: event.target.value })
        }
        error={showError('organizationForm')}
        helperText={getHelperText('organizationForm')}
        sx={styles.fullWidthField}
        slotProps={{ htmlInput: { maxLength: 150 } }}
      />

      <CustomFormattingField
        key={currentLocale}
        label="Опис фонду"
        value={descriptionValue}
        onChange={(description) =>
          updateField('description', {
            ...value.description,
            [currentLocale]: description
          })
        }
        error={showError('description')}
        helperText={getHelperText('description')}
        sx={styles.richTextField}
      />
    </Box>
  );
}
