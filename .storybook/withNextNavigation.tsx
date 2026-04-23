import type { Decorator } from '@storybook/react';

import { type NextNavigationParameters,resetNextNavigationMocks, setNextNavigationParameters } from './mocks/next-navigation';

export const withNextNavigation: Decorator = (Story, context) => {
  resetNextNavigationMocks();
  setNextNavigationParameters(context.parameters.nextNavigation as NextNavigationParameters | undefined);

  return <Story />;
};