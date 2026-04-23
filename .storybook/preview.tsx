import '@fontsource/mulish/400.css';
import '@fontsource/mulish/500.css';
import '@fontsource/mulish/600.css';
import '@fontsource/mulish/700.css';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import './fonts.css';
import '../app/globals.css';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { withStorybookProviders } from './StorybookProviders';
import { withNextNavigation } from './withNextNavigation';

initialize({
  onUnhandledRequest: 'bypass',
});

const preview: Preview = {
  decorators: [withNextNavigation, withStorybookProviders],
  loaders: [mswLoader],
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    nextNavigation: {
      pathname: '/',
    },
  },
};

export default preview;
