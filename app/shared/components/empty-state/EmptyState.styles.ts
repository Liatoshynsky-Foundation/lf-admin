import type { SxProps, Theme } from '@mui/material';

import { colors } from '~/shared/components/design-system/button/Button.styles';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    p: '24px',
    textAlign: 'center'
  } satisfies SxProps<Theme>,

  icon: {
    mb: '4px'
  } satisfies SxProps<Theme>,

  title: {
    color: colors.black
  } satisfies SxProps<Theme>,

  description: {
    color: colors.black,
    maxWidth: '480px',
    whiteSpace: 'pre-line'
  } satisfies SxProps<Theme>
};
