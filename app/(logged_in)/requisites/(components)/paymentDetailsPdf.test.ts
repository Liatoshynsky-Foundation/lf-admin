import { isPaymentDetailsPdfFile, toPaymentDetailsPdfFile } from './paymentDetailsPdf';
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

describe('isPaymentDetailsPdfFile', () => {
  it.each([
    ['application/pdf with .pdf extension', 'requisites.pdf', 'application/pdf', true],
    ['uppercase .PDF extension', 'REQUISITES.PDF', 'application/pdf', true],
    ['empty MIME type with .pdf extension', 'requisites.pdf', '', false],
    ['application/pdf without .pdf extension', 'requisites', 'application/pdf', false],
    ['application/pdf with non-PDF extension', 'requisites.txt', 'application/pdf', false],
    ['non-PDF MIME type with .pdf extension', 'requisites.pdf', 'image/png', false]
  ])('validates %s', (_description, filename, type, expected) => {
    expect(isPaymentDetailsPdfFile(new File(['pdf'], filename, { type }))).toBe(expected);
  });
});

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

  it.each([
    ['a non-PDF MIME type', { filename: 'requisites.pdf', mimeType: 'image/png' }],
    ['a missing .pdf extension', { filename: 'requisites', mimeType: 'application/pdf' }]
  ])('rejects files with %s', (_, pdfOverrides) => {
    expect(() =>
      toPaymentDetailsPdfFile({
        ...mockResolvedPdf,
        pdf: { ...mockResolvedPdf.pdf, ...pdfOverrides }
      })
    ).toThrow(PAYMENT_DETAILS_MESSAGES.pdfInvalidType);
  });
});
