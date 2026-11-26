import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import {
  PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES,
  type PaymentDetailsPdfFile,
  REQUISITES_MESSAGES
} from '~/constants/requisites';
import type { ResolvePdfAttachmentResult } from '~/shared/components/media-modal/resolvePdfAttachmentFromMediaModal';

const PDF_MIME_TYPE = 'application/pdf';
const PDF_EXTENSION = '.pdf';

export const isPaymentDetailsPdfFile = (file: Pick<File, 'name' | 'type'>): boolean =>
  file.type === PDF_MIME_TYPE && file.name.toLowerCase().endsWith(PDF_EXTENSION);

export const toPaymentDetailsPdfFile = ({ pdf, sizeBytes }: ResolvePdfAttachmentResult): PaymentDetailsPdfFile => {
  if (!isPaymentDetailsPdfFile({ name: pdf.filename, type: pdf.mimeType })) {
    throw new Error(PAYMENT_DETAILS_MESSAGES.pdfInvalidType);
  }

  if (sizeBytes === null) {
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
