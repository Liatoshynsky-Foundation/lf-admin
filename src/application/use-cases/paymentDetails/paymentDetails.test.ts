import { paymentDetailsService } from './paymentDetails';
import type { PaymentDetails } from '~/domain/entities/PaymentDetails';
import type { IPaymentDetailsRepository } from '~/domain/repositories/PaymentDetailsRepository';

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
    const paymentDetailsRepository: IPaymentDetailsRepository = {
      getPaymentDetails,
      updatePaymentDetails: jest.fn()
    };
    const service = paymentDetailsService({
      paymentDetailsRepository
    });

    await expect(service.execute()).resolves.toBe(paymentDetails);
    expect(getPaymentDetails).toHaveBeenCalledTimes(1);
  });

  it('saves payment details through repository', async () => {
    const savedPaymentDetails: PaymentDetails = {
      id: 'id',
      slug: 'payment-details',
      tabs: [{ id: 'tab-1', name: 'UAH', content: { type: 'doc' }, order: 0 }],
      pdfFile: null,
      createdAt: 'created',
      updatedAt: 'updated'
    };
    const input = { tabs: [{ name: 'UAH', content: { type: 'doc' } }], pdfFile: null };
    const updatePaymentDetails = jest.fn().mockResolvedValue(savedPaymentDetails);
    const service = paymentDetailsService({
      paymentDetailsRepository: { getPaymentDetails: jest.fn(), updatePaymentDetails }
    });

    await expect(service.update(input)).resolves.toBe(savedPaymentDetails);
    expect(updatePaymentDetails).toHaveBeenCalledWith(input);
  });
});
