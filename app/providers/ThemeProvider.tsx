'use client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import React, { PropsWithChildren } from 'react';

import { adminTheme } from '../shared/theme/theme';

export const ThemeProvider = ({ children }: PropsWithChildren) => (
  <MuiThemeProvider theme={adminTheme}>{children}</MuiThemeProvider>
);
