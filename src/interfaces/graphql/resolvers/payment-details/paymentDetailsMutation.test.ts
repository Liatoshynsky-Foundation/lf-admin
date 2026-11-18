import { PaymentDetailsMutation } from './paymentDetailsMutation';
import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

describe('PaymentDetailsMutation', () => {
  const content = { type: 'doc', content: [{ type: 'paragraph' }] };
  const savedPaymentDetails = {
    id: 'id',
    slug: 'payment-details',
    tabs: [
      { id: 'tab-1', name: 'UAH', content, order: 0 },
      { id: 'tab-2', name: 'USD', content, order: 1 }
    ],
    pdfFile: null,
    createdAt: 'created',
    updatedAt: 'updated'
  };
  const update = jest.fn();
  const context = createMockContext(true, 'paymentDetailsService', { update });
  const unauthorizedContext = createMockContext(false, 'paymentDetailsService', { update });

  beforeEach(() => jest.clearAllMocks());

  it('saves existing and new tabs through the service', async () => {
    update.mockResolvedValue(savedPaymentDetails);
    const input = {
      tabs: [
        { id: 'tab-1', name: 'UAH', content },
        { name: 'USD', content }
      ]
    };

    await expect(PaymentDetailsMutation.updatePaymentDetails({}, { input }, context)).resolves.toEqual(
      savedPaymentDetails
    );
    expect(update).toHaveBeenCalledWith({
      tabs: [
        { id: 'tab-1', name: 'UAH', content },
        { name: 'USD', content }
      ]
    });
  });

  it('trims tab names before saving', async () => {
    update.mockResolvedValue(savedPaymentDetails);

    await PaymentDetailsMutation.updatePaymentDetails({}, { input: { tabs: [{ name: '  UAH  ', content }] } }, context);

    expect(update).toHaveBeenCalledWith({ tabs: [{ name: 'UAH', content }] });
  });

  it('passes the PDF file when it is provided', async () => {
    update.mockResolvedValue(savedPaymentDetails);
    const pdfFile = { filename: 'details.pdf', url: '/details.pdf', mimeType: 'application/pdf',sizeBytes: 2048 };

    await PaymentDetailsMutation.updatePaymentDetails({}, { input: { tabs: [{ name: 'UAH', content }], pdfFile } }, context);

    expect(update).toHaveBeenCalledWith({ tabs: [{ name: 'UAH', content }], pdfFile });
  });

  it('does not send the PDF file to the service when it is omitted, so the stored file is kept', async () => {
    update.mockResolvedValue(savedPaymentDetails);

    await PaymentDetailsMutation.updatePaymentDetails({}, { input: { tabs: [{ name: 'UAH', content }] } }, context);

    expect(update.mock.calls[0][0]).not.toHaveProperty('pdfFile');
  });

  it('passes an explicit null PDF file to remove the stored file', async () => {
    update.mockResolvedValue(savedPaymentDetails);

    await PaymentDetailsMutation.updatePaymentDetails(
      {},
      { input: { tabs: [{ name: 'UAH', content }], pdfFile: null } },
      context
    );

    expect(update).toHaveBeenCalledWith({ tabs: [{ name: 'UAH', content }], pdfFile: null });
  });

  it('rejects a PDF file exceeding 20 MB with BAD_USER_INPUT', async () => {
    const pdfFile = {
      filename: 'details.pdf',
      url: '/details.pdf',
      mimeType: 'application/pdf',
      sizeBytes: MAX_PDF_SIZE_BYTES + 1
    };

    await expect(
      PaymentDetailsMutation.updatePaymentDetails({}, { input: { tabs: [{ name: 'UAH', content }], pdfFile } }, context)
    ).rejects.toMatchObject({
      extensions: {
        code: 'BAD_USER_INPUT',
        issues: expect.arrayContaining([
          expect.objectContaining({ message: PAYMENT_DETAILS_MESSAGES.pdfFileMaxSize })
        ])
      }
    });
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    ['no tabs', { tabs: [] }],
    ['an empty tab name', { tabs: [{ name: '   ', content }] }],
    ['duplicate tab names', { tabs: [{ name: 'UAH', content }, { name: 'uah', content }] }],
    ['invalid TipTap content', { tabs: [{ name: 'UAH', content: { type: 'paragraph' } }] }]
  ])('rejects input with %s', async (_description, input) => {
    await expect(PaymentDetailsMutation.updatePaymentDetails({}, { input }, context)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' }
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects unauthorized users before accessing the service', async () => {
    await expect(
      PaymentDetailsMutation.updatePaymentDetails({}, { input: { tabs: [{ name: 'UAH', content }] } }, unauthorizedContext)
    ).rejects.toMatchObject({
      extensions: { code: 'UNAUTHENTICATED' }
    });
    expect(update).not.toHaveBeenCalled();
  });
});