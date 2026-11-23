import { toPaymentDetailsPdfFile } from './paymentDetailsPdf';
import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import { PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES, REQUISITES_MESSAGES } from '~/constants/requisites';
import type { ResolvePdfAttachmentResult } from '~/shared/components/media-modal/resolvePdfAttachmentFromMediaModal';

const mockResolvedPdf: ResolvePdfAttachmentResult = {
  pdf: {
    filename: 'requisites.pdf',
    url: 'https://example.com/requisites.pdf',
    mimeType: 'application/pdf'
  },
  source: 'library',
  sizeBytes: 2048
};

describe('toPaymentDetailsPdfFile', () => {
  it.each([
    ['with size', 2048],
    ['at the size limit', PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES]
  ])('maps a PDF %s', (_, sizeBytes) => {
    expect(toPaymentDetailsPdfFile({ ...mockResolvedPdf, sizeBytes })).toEqual({
      ...mockResolvedPdf.pdf,
      sizeBytes
    });
  });

  it('rejects PDFs without size metadata', () => {
    expect(() => toPaymentDetailsPdfFile({ ...mockResolvedPdf, sizeBytes: null })).toThrow(
      REQUISITES_MESSAGES.PDF_SIZE_UNKNOWN
    );
  });

  it('rejects PDFs larger than 20 MB', () => {
    expect(() =>
      toPaymentDetailsPdfFile({ ...mockResolvedPdf, sizeBytes: PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES + 1 })
    ).toThrow(PAYMENT_DETAILS_MESSAGES.pdfFileMaxSize);
  });

  it('rejects non-PDF files', () => {
    expect(() =>
      toPaymentDetailsPdfFile({
        ...mockResolvedPdf,
        pdf: { ...mockResolvedPdf.pdf, filename: 'requisites.png', mimeType: 'image/png' }
      })
    ).toThrow(PAYMENT_DETAILS_MESSAGES.pdfInvalidType);
  });
});
