'use client';
import { TextField } from '@mui/material';
import { useState } from 'react';

import { styles } from '../SeoMetadataForm.styles';

interface SeoCanonicalUrlFieldProps {
  readonly value: string;
  readonly onChange: (val: string) => void;
  readonly onBlur?: () => void;
  readonly label?: string;
}

const validateCanonicalUrl = (val: string): string => {
  if (!val.trim()) return 'Обовʼязкове поле';
  try {
    new URL(val);
    return '';
  } catch {
    return 'Некоректний URL';
  }
};

export function SeoCanonicalUrlField({ value, onChange, onBlur, label }: SeoCanonicalUrlFieldProps) {
  const [touched, setTouched] = useState(false);

  const error = touched ? validateCanonicalUrl(value) : '';

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  const handleChange = (val: string) => {
    onChange(val);
    if (touched) setTouched(true);
  };

  return (
    <TextField
      label={label || 'Canonical URL'}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      error={Boolean(error)}
      helperText={error}
      fullWidth
      sx={styles.textField}
    />
  );
}
