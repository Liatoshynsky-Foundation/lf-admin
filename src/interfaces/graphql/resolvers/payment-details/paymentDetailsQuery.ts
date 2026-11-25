import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { toPublicPaymentDetails } from '~/interfaces/graphql/resolvers/payment-details/publicPaymentDetails';

export const PaymentDetailsQuery = {
  paymentDetails: async (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    return await context.requestContainer.cradle.paymentDetailsService.execute();
  },

  publicPaymentDetails: async (_: unknown, __: unknown, context: GraphQLContext) => {
    const paymentDetails = await context.requestContainer.cradle.paymentDetailsService.execute();

    return toPublicPaymentDetails(paymentDetails);
  }
};
