import { PaymentDetailsQuery } from './paymentDetailsQuery';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';

describe('PaymentDetailsQuery', () => {
  const paymentDetails = {
    id: 'id',
    slug: 'payment-details',
    tabs: [
      { id: 'tab-1', name: 'UAH', content: { type: 'doc' }, order: 0 },
      { id: 'tab-2', name: 'USD', content: { type: 'doc' }, order: 1 }
    ],
    pdfFile: { filename: 'details.pdf', url: '/details.pdf', mimeType: 'application/pdf' },
    createdAt: 'created',
    updatedAt: 'updated'
  };
  const execute = jest.fn();
  const context = createMockContext(true, 'paymentDetailsService', { execute });
  const unauthorizedContext = createMockContext(false, 'paymentDetailsService', { execute });

  beforeEach(() => jest.clearAllMocks());

  it('returns payment details from service', async () => {
    execute.mockResolvedValue(paymentDetails);

    await expect(PaymentDetailsQuery.paymentDetails({}, {}, context)).resolves.toEqual(paymentDetails);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('returns null when payment details are not configured', async () => {
    execute.mockResolvedValue(null);

    await expect(PaymentDetailsQuery.paymentDetails({}, {}, context)).resolves.toBeNull();
  });

  it('rejects unauthorized users before accessing service', async () => {
    await expect(PaymentDetailsQuery.paymentDetails({}, {}, unauthorizedContext)).rejects.toMatchObject({
      extensions: { code: 'UNAUTHENTICATED' }
    });
    expect(execute).not.toHaveBeenCalled();
  });
});
