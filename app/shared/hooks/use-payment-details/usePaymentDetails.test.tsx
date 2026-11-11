import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';

import { normalizePaymentDetails, usePaymentDetails } from './usePaymentDetails';
import { GetPaymentDetailsDocument, type GetPaymentDetailsQuery } from '~/types/graphql/generated/graphql';

const paymentDetailsData: GetPaymentDetailsQuery = {
  paymentDetails: {
    id: 'payment-details',
    slug: 'payment-details',
    createdAt: 'created',
    updatedAt: 'updated',
    pdfFile: null,
    tabs: [
      {
        id: 'usd',
        name: 'USD',
        content: { type: 'doc' },
        order: 2
      },
      {
        id: 'uah',
        name: 'UAH',
        content: { type: 'doc' },
        order: 1
      }
    ]
  }
};

const successMock: MockedResponse = {
  request: { query: GetPaymentDetailsDocument },
  result: { data: paymentDetailsData }
};

const errorMock: MockedResponse = {
  request: { query: GetPaymentDetailsDocument },
  result: { errors: [new GraphQLError('Payment details request failed')] }
};

const renderPaymentDetailsHook = (mocks: MockedResponse[]) =>
  renderHook(() => usePaymentDetails(), {
    wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>
  });

describe('usePaymentDetails', () => {
  it('reports loading state before the query resolves', () => {
    const { result } = renderPaymentDetailsHook([successMock]);

    expect(result.current.loading).toBe(true);
  });

  it('returns normalized payment details after a successful response', async () => {
    const { result } = renderPaymentDetailsHook([successMock]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.tabs.map((tab) => tab.name)).toEqual(['UAH', 'USD']);
  });

  it('returns GraphQL errors from the query', async () => {
    const { result } = renderPaymentDetailsHook([errorMock]);

    await waitFor(() => {
      expect(result.current.error?.message).toBe('Payment details request failed');
    });
  });
});

describe('normalizePaymentDetails', () => {
  it('sorts tabs by configured order', () => {
    expect(normalizePaymentDetails(paymentDetailsData)?.tabs.map((tab) => tab.name)).toEqual(['UAH', 'USD']);
  });

  it('returns null when API has no payment details', () => {
    expect(normalizePaymentDetails({ paymentDetails: null })).toBeNull();
  });
});
