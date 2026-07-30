'use client';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import { styles } from '../SeoMetadataForm.styles';

interface SeoCanonicalUrlFieldProps {
  readonly value: string;
  readonly onChange: (val: string) => void;
  readonly onBlur?: () => void;
  readonly label?: string;
  readonly externalError?: string;
  readonly forceShowErrors?: boolean;
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

export function SeoCanonicalUrlField({ value, externalError, onChange, onBlur, label, forceShowErrors = false }: SeoCanonicalUrlFieldProps) {
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (forceShowErrors) setTouched(true);
  }, [forceShowErrors]);

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
      error={Boolean(error) || Boolean(externalError)}
      helperText={error || externalError}
      fullWidth
      required
      sx={styles.textField}
    />
  );
}
