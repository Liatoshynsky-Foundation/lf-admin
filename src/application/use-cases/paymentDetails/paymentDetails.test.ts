import { paymentDetailsService } from './paymentDetails';
import type { PaymentDetails } from '~/domain/entities/PaymentDetails';

describe('paymentDetailsService', () => {
  it('retrieves payment details through repository', async () => {
    const paymentDetails: PaymentDetails = {
      id: 'id',
      slug: 'payment-details',
      tabs: [],
      pdfFile: null,
      createdAt: 'created',
      updatedAt: 'updated'
    };
    const getPaymentDetails = jest.fn().mockResolvedValue(paymentDetails);
    const service = paymentDetailsService({
      paymentDetailsRepository: { getPaymentDetails }
    });

    await expect(service.execute()).resolves.toBe(paymentDetails);
    expect(getPaymentDetails).toHaveBeenCalledTimes(1);
  });
});
