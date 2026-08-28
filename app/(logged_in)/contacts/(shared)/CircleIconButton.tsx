import { IconButton } from '@mui/material';
import { MouseEventHandler, ReactNode } from 'react';

export type CircleIconButtonVariant = 'outlined' | 'filled';

type CircleIconButtonProps = Readonly<{
  icon: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  variant?: CircleIconButtonVariant;
}>;

export const CircleIconButton = ({ icon, onClick, variant = 'outlined' }: CircleIconButtonProps) => (
  <IconButton
    onClick={onClick}
    sx={{
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: 1,
      borderColor: variant === 'filled' ? 'common.black' : 'adminBlue.900',
      backgroundColor: variant === 'filled' ? 'common.black' : 'transparent',
      color: variant === 'filled' ? 'common.white' : 'inherit',
      '&:hover': { backgroundColor: variant === 'filled' ? 'adminBlue.900' : undefined }
    }}
  >
    {icon}
  </IconButton>
);
