import { Stack, TextField } from '@mui/material';

import type { LocalizedMeta } from '../SeoMetadataForm';
import { styles } from '../SeoMetadataForm.styles';

interface SeoBaseFieldsProps {
  readonly value: LocalizedMeta;
  readonly errors: Partial<Record<keyof LocalizedMeta, string>>;
  readonly touched: Partial<Record<keyof LocalizedMeta, boolean>>;
  readonly onFieldChange: (field: keyof LocalizedMeta, val: string) => void;
  readonly onBlur: (field: keyof LocalizedMeta) => void;
  readonly labels?: {
    readonly metaTitle?: string;
    readonly metaDescription?: string;
    readonly metaKeywords?: string;
  };
}

export function SeoBaseFields({ value, errors, touched, onFieldChange, onBlur, labels = {} }: SeoBaseFieldsProps) {
  const fields = [
    { key: 'title' as const, label: labels.metaTitle || 'Meta title', required: true },
    {
      key: 'description' as const,
      label: labels.metaDescription || 'Meta description',
      required: true,
      multiline: true,
      minRows: 2
    },
    { key: 'keywords' as const, label: labels.metaKeywords || 'Meta keywords' }
  ];

  return (
    <Stack sx={styles.formFields}>
      {fields.map(({ key, label, required, multiline, minRows }) => (
        <TextField
          key={key}
          label={label}
          value={value[key] || ''}
          onChange={(e) => onFieldChange(key, e.target.value)}
          onBlur={() => onBlur(key)}
          error={Boolean(errors[key])}
          helperText={errors[key] && touched[key] ? errors[key] : ''}
          fullWidth
          sx={styles.textField}
          required={required}
          multiline={multiline}
          minRows={minRows}
        />
      ))}
    </Stack>
  );
}
