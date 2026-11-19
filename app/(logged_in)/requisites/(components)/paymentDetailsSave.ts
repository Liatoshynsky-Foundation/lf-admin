import { ApolloError } from '@apollo/client';

import type { PaymentDetailsPdfFile, PaymentDetailsTab } from '~/constants/requisites';
import { REQUISITES_MESSAGES } from '~/constants/requisites';
import type { UpdatePaymentDetailsInput } from '~/types/graphql/generated/graphql';

type ValidationIssue = { message?: string };

export const buildPaymentDetailsInput = (
  tabs: PaymentDetailsTab[],
  savedTabIds: ReadonlySet<string>,
  pdfFile: PaymentDetailsPdfFile | null
): UpdatePaymentDetailsInput => ({
  tabs: tabs.map(({ id, name, content }) => ({
    ...(savedTabIds.has(id) && { id }),
    name,
    content
  })),
  ...(pdfFile &&
    typeof pdfFile.sizeBytes === 'number' && {
    pdfFile: {
      filename: pdfFile.filename,
      url: pdfFile.url,
      mimeType: pdfFile.mimeType,
      sizeBytes: pdfFile.sizeBytes
    }
  })
});

export const getSaveErrorMessage = (error: unknown): string => {
  if (error instanceof ApolloError) {
    const issues = error.graphQLErrors[0]?.extensions?.issues as ValidationIssue[] | undefined;
    const issueMessage = issues?.find((issue) => issue.message)?.message;

    if (issueMessage) return issueMessage;
  }

  return REQUISITES_MESSAGES.SAVE_ERROR;
};