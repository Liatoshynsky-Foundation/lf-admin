import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';

import { mainHexPallete as colors } from '~/shared/theme/colors';

type ViewToggleStyles = {
  root: SystemStyleObject<Theme>;
  button: SystemStyleObject<Theme>;
  active: SystemStyleObject<Theme>;
  inactive: SystemStyleObject<Theme>;
};

export const styles: ViewToggleStyles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    p: '4px',
    borderRadius: '23px',
    bgcolor: colors.blue[100],
    width: 'fit-content',
    gap: '4px'
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: '19px',
    p: '4px'
  },
  active: {
    bgcolor: colors.black,
    color: colors.white,
    '&:hover': {
      bgcolor: colors.black
    }
  },
  inactive: {
    bgcolor: 'transparent',
    color: colors.black,
    '&:hover': {
      bgcolor: colors.blue[200]
    }
  }
};
