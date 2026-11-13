'use client';

import { useMemo } from 'react';

import type { PaymentDetails } from '~/constants/requisites';
import { useGetPaymentDetailsQuery } from '~/types/graphql/generated/graphql';

type PaymentDetailsResponse = ReturnType<typeof useGetPaymentDetailsQuery>['data'];

export const normalizePaymentDetails = (data: PaymentDetailsResponse): PaymentDetails | null => {
  const paymentDetails = data?.paymentDetails;
  if (!paymentDetails) return null;

  return {
    ...paymentDetails,
    tabs: [...paymentDetails.tabs].sort((first, second) => first.order - second.order)
  };
};

export const usePaymentDetails = () => {
  const { data, loading, error } = useGetPaymentDetailsQuery({
    fetchPolicy: 'network-only'
  });
  const paymentDetails = useMemo(() => normalizePaymentDetails(data), [data]);

  return {
    data: paymentDetails,
    loading,
    error
  };
};
