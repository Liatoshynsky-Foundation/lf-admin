import { PaymentDetailsQuery } from './paymentDetailsQuery';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';

const textContent = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
});

describe('PaymentDetailsQuery', () => {
  const pdfFile = { filename: 'details.pdf', url: '/details.pdf', mimeType: 'application/pdf', sizeBytes: 100 };
  const paymentDetails = {
    id: 'id',
    slug: 'payment-details',
    tabs: [
      { id: 'tab-2', name: 'USD', content: textContent('IBAN USD'), order: 1 },
      { id: 'tab-empty', name: 'EUR', content: { type: 'doc', content: [{ type: 'paragraph' }] }, order: 2 },
      { id: 'tab-1', name: 'UAH', content: textContent('IBAN UAH'), order: 0 }
    ],
    pdfFile,
    createdAt: 'created',
    updatedAt: 'updated'
  };
  const execute = jest.fn();
  const adminContext = createMockContext(true, 'paymentDetailsService', { execute });
  const publicContext = createMockContext(false, 'paymentDetailsService', { execute });

  beforeEach(() => jest.clearAllMocks());

  it('returns full payment details to admins, including empty tabs', async () => {
    execute.mockResolvedValue(paymentDetails);

    await expect(PaymentDetailsQuery.paymentDetails({}, {}, adminContext)).resolves.toEqual(paymentDetails);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('allows public users to read payment details without authentication', async () => {
    execute.mockResolvedValue(paymentDetails);

    const result = await PaymentDetailsQuery.paymentDetails({}, {}, publicContext);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(result?.tabs.map((tab) => tab.id)).toEqual(['tab-1', 'tab-2']);
    expect(result?.pdfFile).toEqual(pdfFile);
  });

  it('returns null for public users when payment details are not configured', async () => {
    execute.mockResolvedValue(null);

    await expect(PaymentDetailsQuery.paymentDetails({}, {}, publicContext)).resolves.toBeNull();
  });
});
