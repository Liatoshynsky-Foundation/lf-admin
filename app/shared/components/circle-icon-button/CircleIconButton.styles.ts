import { SxProps, Theme } from '@mui/material';

import type { CircleIconButtonVariant } from './CircleIconButton';

export const styles = {
  button: (variant: CircleIconButtonVariant, size: number): SxProps<Theme> => ({
    width: size,
    height: size,
    borderRadius: '50%',
    border: 1,
    borderColor: variant === 'filled' ? 'common.black' : 'adminBlue.900',
    backgroundColor: variant === 'filled' ? 'common.black' : 'transparent',
    color: variant === 'filled' ? 'common.white' : 'inherit',
    '&:hover': { backgroundColor: variant === 'filled' ? 'adminBlue.900' : undefined }
  })
};
