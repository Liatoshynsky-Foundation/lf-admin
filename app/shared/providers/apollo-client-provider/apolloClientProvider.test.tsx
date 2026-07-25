import 'whatwg-fetch';
import '@testing-library/jest-dom';
import { useQuery } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { ApolloClientProvider } from './apolloClientProvider';
import { TEST_QUERY } from '~/types/graphql/testGraphql';

const ConsumerComponent = () => {
  const { loading, error, data } = useQuery(TEST_QUERY);
  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>Сталася помилка: {error.message}</p>;
  return <h1>{data?.testData.message}</h1>;
};

const successMock: MockedResponse = {
  request: {
    query: TEST_QUERY
  },
  result: {
    data: {
      testData: { __typename: 'TestData', id: '1', message: 'Провайдер працює!' }
    }
  }
};

describe('ApolloClientProvider', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    const consoleObj = globalThis['console'];
    const originalWarn = consoleObj.warn;
    const originalError = consoleObj.error;

    consoleWarnSpy = jest.spyOn(consoleObj, 'warn').mockImplementation((...args) => {
      const firstArg = args[0];
      if (
        typeof firstArg === 'string' &&
        (firstArg.includes('go.apollo.dev') ||
          firstArg.includes('InMemoryCache') ||
          firstArg.includes('canonizeResults'))
      ) {
        return;
      }
      originalWarn.apply(consoleObj, args);
    });

    consoleErrorSpy = jest.spyOn(consoleObj, 'error').mockImplementation((...args) => {
      const firstArg = args[0];
      if (
        typeof firstArg === 'string' &&
        (firstArg.includes('go.apollo.dev') || firstArg.includes('An error occurred'))
      ) {
        return;
      }
      originalError.apply(consoleObj, args);
    });
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should provide an Apollo Client that allows child components to execute requests', async () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <ConsumerComponent />
      </MockedProvider>
    );

    expect(screen.getByText('Завантаження...')).toBeInTheDocument();

    const finalMessage = await screen.findByText('Провайдер працює!');

    expect(finalMessage).toBeInTheDocument();
    expect(screen.queryByText('Завантаження...')).not.toBeInTheDocument();
  });

  it('should render child elements without crashing', () => {
    render(
      <ApolloClientProvider>
        <div data-testid="child">Я дочірній елемент</div>
      </ApolloClientProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Я дочірній елемент');
  });
});
