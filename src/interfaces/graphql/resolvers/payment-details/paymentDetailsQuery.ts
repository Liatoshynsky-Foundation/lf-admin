import type { GraphQLContext } from '~/back-shared/types/container/types';
import { toPublicPaymentDetails } from '~/interfaces/graphql/resolvers/payment-details/publicPaymentDetails';

export const PaymentDetailsQuery = {
  paymentDetails: async (_: unknown, __: unknown, context: GraphQLContext) => {
    const paymentDetails = await context.requestContainer.cradle.paymentDetailsService.execute();

    return context.admin ? paymentDetails : toPublicPaymentDetails(paymentDetails);
  }
};
