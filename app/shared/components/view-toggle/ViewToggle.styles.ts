import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';

import { colors } from '~/shared/components/design-system/button/Button.styles';

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
    borderRadius: '999px',
    bgcolor: colors.blue[100],
    width: 'fit-content'
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: '999px',
    p: '4px',
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
