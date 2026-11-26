import { Box } from '@mui/material';
import { Plus } from 'lucide-react';
import { MouseEventHandler, ReactNode } from 'react';

import { CircleIconButton, CircleIconButtonVariant } from '../circle-icon-button/CircleIconButton';
import { styles } from './IconTextField.styles';
import { CustomTextField } from '~/ds-components/text-field/TextField';

export type IconTextFieldProps = Readonly<{
  icon?: ReactNode;
  onIconClick: MouseEventHandler<HTMLButtonElement>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  iconButtonVariant?: CircleIconButtonVariant;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
  placeholder?: string;
}>;

const defaultIcon = <Plus size={40} strokeWidth={1} />;

export const IconTextField = ({
  icon,
  onIconClick,
  label,
  value,
  onChange,
  iconButtonVariant,
  error,
  helperText,
  placeholder,
  onBlur
}: IconTextFieldProps) => (
  <Box sx={styles.container}>
    <CircleIconButton icon={icon ?? defaultIcon} onClick={onIconClick} variant={iconButtonVariant} />
    <CustomTextField
      label={label}
      value={value}
      placeholder={placeholder}
      slotProps={{ inputLabel: placeholder ? { shrink: true } : undefined }}
      onChange={(event) => onChange(event.target.value)}
      error={error}
      helperText={helperText}
      onBlur={onBlur}
      fullWidth
    />
  </Box>
);
