import '@fontsource/mulish/400.css';
import '@fontsource/mulish/500.css';
import '@fontsource/mulish/600.css';
import '@fontsource/mulish/700.css';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import './fonts.css';
import '../app/globals.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { Preview } from '@storybook/react';
import React from 'react';

import { createAdminTheme } from '../app/shared/theme/theme';

const adminTheme = createAdminTheme();

const preview: Preview = {
  decorators: [
    (Story) => (
      <MuiThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Story />
      </MuiThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;
