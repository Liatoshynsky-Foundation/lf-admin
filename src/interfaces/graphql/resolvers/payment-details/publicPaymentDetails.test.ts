import { toPublicPaymentDetails } from './publicPaymentDetails';
import type { PaymentDetails } from '~/domain/entities/PaymentDetails';

const textContent = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
});

const tableContent = (label: string, value: string) => ({
  type: 'doc',
  content: [
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            { type: 'tableHeader', content: [{ type: 'paragraph', content: label ? [{ type: 'text', text: label }] : [] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: value ? [{ type: 'text', text: value }] : [] }] }
          ]
        }
      ]
    }
  ]
});

const pdfFile = { filename: 'details.pdf', url: '/details.pdf', mimeType: 'application/pdf', sizeBytes: 100 };

const createPaymentDetails = (overrides: Partial<PaymentDetails> = {}): PaymentDetails => ({
  id: 'id',
  slug: 'payment-details',
  tabs: [{ id: 'tab-1', name: 'UAH', content: textContent('IBAN'), order: 0 }],
  pdfFile,
  createdAt: 'created',
  updatedAt: 'updated',
  ...overrides
});

describe('toPublicPaymentDetails', () => {
  it('returns null when payment details are missing', () => {
    expect(toPublicPaymentDetails(null)).toBeNull();
  });

  it('sorts tabs by their saved order', () => {
    const result = toPublicPaymentDetails(
      createPaymentDetails({
        tabs: [
          { id: 'tab-3', name: 'EUR', content: textContent('EUR'), order: 2 },
          { id: 'tab-1', name: 'UAH', content: textContent('UAH'), order: 0 },
          { id: 'tab-2', name: 'USD', content: textContent('USD'), order: 1 }
        ]
      })
    );

    expect(result?.tabs.map((tab) => tab.id)).toEqual(['tab-1', 'tab-2', 'tab-3']);
  });

  it('excludes empty and whitespace-only tabs', () => {
    const result = toPublicPaymentDetails(
      createPaymentDetails({
        tabs: [
          { id: 'filled', name: 'UAH', content: textContent('IBAN'), order: 0 },
          { id: 'empty-doc', name: 'USD', content: { type: 'doc', content: [{ type: 'paragraph' }] }, order: 1 },
          { id: 'whitespace', name: 'EUR', content: textContent('   \n '), order: 2 },
          { id: 'empty-table', name: 'PLN', content: tableContent('', ''), order: 3 },
          { id: 'blank-name', name: '   ', content: textContent('IBAN'), order: 4 }
        ]
      })
    );

    expect(result?.tabs.map((tab) => tab.id)).toEqual(['filled']);
  });

  it('keeps tabs whose text is inside a table', () => {
    const result = toPublicPaymentDetails(
      createPaymentDetails({ tabs: [{ id: 'table', name: 'UAH', content: tableContent('IBAN', ''), order: 0 }] })
    );

    expect(result?.tabs.map((tab) => tab.id)).toEqual(['table']);
  });

  it('returns an empty tabs list when every tab is empty', () => {
    const result = toPublicPaymentDetails(
      createPaymentDetails({ tabs: [{ id: 'empty', name: 'UAH', content: { type: 'doc' }, order: 0 }] })
    );

    expect(result?.tabs).toEqual([]);
  });

  it('returns the same global PDF file regardless of tabs', () => {
    expect(toPublicPaymentDetails(createPaymentDetails())?.pdfFile).toEqual(pdfFile);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a file without url', { ...pdfFile, url: '' }]
  ])('returns null PDF file when the attachment is %s', (_, value) => {
    expect(toPublicPaymentDetails(createPaymentDetails({ pdfFile: value }))?.pdfFile).toBeNull();
  });
});
