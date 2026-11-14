import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { PaymentDetails } from '~/domain/entities/PaymentDetails';
import type { UpdatePaymentDetailsInput } from '~/domain/repositories/PaymentDetailsRepository';
import { zPaymentDetailsUpdateSchema } from '~/validators/paymentDetails.schema';

type UpdatePaymentDetailsArgs = {
  input: Omit<UpdatePaymentDetailsInput, 'pdfFile'> & {
    pdfFile?: UpdatePaymentDetailsInput['pdfFile'];
  };
};

const validateInput = (input: UpdatePaymentDetailsArgs['input']): UpdatePaymentDetailsInput => {
  try {
    return zPaymentDetailsUpdateSchema.parse({ ...input, pdfFile: input.pdfFile ?? null });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GraphQLError('Invalid payment details input', {
        extensions: {
          code: 'BAD_USER_INPUT',
          issues: error.issues
        }
      });
    }

    throw error;
  }
};

export const PaymentDetailsMutation = {
  updatePaymentDetails: async (
    _: unknown,
    { input }: UpdatePaymentDetailsArgs,
    context: GraphQLContext
  ): Promise<PaymentDetails> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const validatedInput = validateInput(input);

    return await context.requestContainer.cradle.paymentDetailsService.update(validatedInput);
  }
};