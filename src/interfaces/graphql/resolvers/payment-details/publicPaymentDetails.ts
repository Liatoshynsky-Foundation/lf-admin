import type { JSONContent } from '@tiptap/react';

import type { PaymentDetails, PaymentDetailsPdfFile, PaymentDetailsTab } from '~/domain/entities/PaymentDetails';

const hasText = (node: JSONContent | undefined): boolean => {
  if (!node || typeof node !== 'object') return false;
  if (typeof node.text === 'string' && node.text.trim().length > 0) return true;

  return Array.isArray(node.content) && node.content.some(hasText);
};

const isPublicTab = (tab: PaymentDetailsTab): boolean => tab.name.trim().length > 0 && hasText(tab.content);

const toPublicPdfFile = (pdfFile: PaymentDetailsPdfFile | null | undefined): PaymentDetailsPdfFile | null =>
  pdfFile?.url ? pdfFile : null;

export const toPublicPaymentDetails = (paymentDetails: PaymentDetails | null): PaymentDetails | null => {
  if (!paymentDetails) return null;

  return {
    ...paymentDetails,
    tabs: [...paymentDetails.tabs].filter(isPublicTab).sort((first, second) => first.order - second.order),
    pdfFile: toPublicPdfFile(paymentDetails.pdfFile)
  };
};
