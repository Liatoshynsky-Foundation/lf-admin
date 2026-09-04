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
}>;

const defaultIcon = <Plus size={40} strokeWidth={1} />;

export const IconTextField = ({ icon, onIconClick, label, value, onChange, iconButtonVariant }: IconTextFieldProps) => (
  <Box sx={styles.container}>
    <CircleIconButton icon={icon ?? defaultIcon} onClick={onIconClick} variant={iconButtonVariant} />
    <CustomTextField label={label} value={value} onChange={(event) => onChange(event.target.value)} fullWidth />
  </Box>
);
