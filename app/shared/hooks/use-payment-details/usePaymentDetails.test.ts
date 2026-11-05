import { normalizePaymentDetails } from './usePaymentDetails';

describe('normalizePaymentDetails', () => {
  it('sorts tabs by configured order', () => {
    const data = {
      paymentDetails: {
        id: 'payment-details',
        slug: 'payment-details',
        createdAt: 'created',
        updatedAt: 'updated',
        pdfFile: null,
        tabs: [
          { id: 'usd', name: 'USD', content: { type: 'doc' }, order: 2 },
          { id: 'uah', name: 'UAH', content: { type: 'doc' }, order: 1 }
        ]
      }
    };

    expect(normalizePaymentDetails(data)?.tabs.map((tab) => tab.name)).toEqual(['UAH', 'USD']);
  });

  it('returns null when API has no payment details', () => {
    expect(normalizePaymentDetails({ paymentDetails: null })).toBeNull();
  });
});
