import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import {
  PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES,
  type PaymentDetailsPdfFile,
  REQUISITES_MESSAGES
} from '~/constants/requisites';
import { matchesPdf } from '~/shared/components/media-modal/MediaModal.utils';
import type { ResolvePdfAttachmentResult } from '~/shared/components/media-modal/resolvePdfAttachmentFromMediaModal';

export const toPaymentDetailsPdfFile = ({ pdf, sizeBytes }: ResolvePdfAttachmentResult): PaymentDetailsPdfFile => {
  if (!matchesPdf(pdf.mimeType, pdf.filename)) {
    throw new Error(PAYMENT_DETAILS_MESSAGES.pdfInvalidType);
  }

  if (typeof sizeBytes !== 'number') {
    throw new Error(REQUISITES_MESSAGES.PDF_SIZE_UNKNOWN);
  }

  if (sizeBytes > PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES) {
    throw new Error(PAYMENT_DETAILS_MESSAGES.pdfFileMaxSize);
  }

  return {
    filename: pdf.filename,
    url: pdf.url,
    mimeType: pdf.mimeType,
    sizeBytes
  };
};
