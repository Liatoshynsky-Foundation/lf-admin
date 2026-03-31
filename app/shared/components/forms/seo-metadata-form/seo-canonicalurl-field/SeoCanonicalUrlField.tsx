import { TextField } from '@mui/material';

import { styles } from '../SeoMetadataForm.styles';

interface SeoCanonicalUrlFieldProps {
  value: string;
  error?: string;
  touched?: boolean;
  onChange: (val: string) => void;
  onBlur: () => void;
  label?: string;
}

export function SeoCanonicalUrlField({ value, error, touched, onChange, onBlur, label }: SeoCanonicalUrlFieldProps) {
  return (
    <TextField
      label={label || 'Canonical URL'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={Boolean(error && touched)}
      helperText={error && touched ? error : ''}
      fullWidth
      sx={styles.textField}
    />
  );
}
