import { IconButton } from '@mui/material';
import { MouseEventHandler, ReactNode } from 'react';

import { styles } from './CircleIconButton.styles';

export type CircleIconButtonVariant = 'outlined' | 'filled';

type CircleIconButtonProps = Readonly<{
  icon: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  variant?: CircleIconButtonVariant;
  size?: number;
}>;

export const CircleIconButton = ({ icon, onClick, variant = 'outlined', size = 40 }: CircleIconButtonProps) => (
  <IconButton
    onClick={onClick}
    sx={styles.button(variant, size)}
  >
    {icon}
  </IconButton>
);
