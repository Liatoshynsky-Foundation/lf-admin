import { TextField } from '@mui/material';

import { styles } from '../SeoMetadataForm.styles';

interface SeoCanonicalUrlFieldProps {
  readonly value: string;
  readonly error?: string;
  readonly touched?: boolean;
  readonly onChange: (val: string) => void;
  readonly onBlur: () => void;
  readonly label?: string;
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
