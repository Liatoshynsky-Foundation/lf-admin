'use client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import React, { PropsWithChildren, useMemo } from 'react';

import { createAdminTheme } from '../shared/theme/theme';

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useMemo(() => createAdminTheme(), []);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};
