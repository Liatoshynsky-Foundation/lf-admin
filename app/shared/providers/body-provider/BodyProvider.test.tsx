import 'whatwg-fetch';
import { render, screen } from '@testing-library/react';
import React from 'react';

import BodyProvider from './BodyProvider';

describe('BodyProvider', () => {
  let originalError: typeof console.error;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    const consoleObj = globalThis['console'];
    originalError = consoleObj.error;
    consoleErrorSpy = jest.spyOn(consoleObj, 'error').mockImplementation((...args) => {
      const firstArg = args[0];
      if (
        typeof firstArg === 'string' &&
        (firstArg.includes('cannot be a child of') || firstArg.includes('hydration error'))
      ) {
        return;
      }
      originalError.apply(consoleObj, args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should render children correctly', () => {
    render(
      <BodyProvider>
        <div data-testid="child">Test Child</div>
      </BodyProvider>
    );

    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Child');
  });
});
