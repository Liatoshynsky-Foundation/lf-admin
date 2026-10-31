import { zPaymentDetailsSchema, zPaymentDetailsUpdateSchema } from './paymentDetails.schema';
import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';

const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Account details' }]
    }
  ]
};

const pdfFile = {
  filename: 'payment-details.pdf',
  url: 'https://example.com/payment-details.pdf',
  mimeType: 'application/pdf'
};

describe('payment details schemas', () => {
  it('accepts a persisted payment details document', () => {
    const result = zPaymentDetailsSchema.safeParse({
      tabs: [{ name: 'UAH', content, order: 0 }],
      pdfFile
    });

    expect(result.success).toBe(true);
  });

  it('accepts an aggregate update with new and existing tabs', () => {
    const result = zPaymentDetailsUpdateSchema.safeParse({
      tabs: [
        { id: '507f1f77bcf86cd799439011', name: 'UAH', content },
        { name: 'EUR', content }
      ],
      pdfFile: null
    });

    expect(result.success).toBe(true);
  });

  it('rejects duplicate tab names case-insensitively and after trimming', () => {
    const result = zPaymentDetailsUpdateSchema.safeParse({
      tabs: [
        { name: 'UAH', content },
        { name: ' uah ', content }
      ],
      pdfFile: null
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['tabs'],
        message: PAYMENT_DETAILS_MESSAGES.tabNameDuplicate
      })
    );
  });

  it('rejects an empty tab list', () => {
    const result = zPaymentDetailsUpdateSchema.safeParse({
      tabs: [],
      pdfFile: null
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(PAYMENT_DETAILS_MESSAGES.atLeastOneTabRequired);
  });

  it.each([
    ['', PAYMENT_DETAILS_MESSAGES.tabNameRequired],
    ['a'.repeat(41), PAYMENT_DETAILS_MESSAGES.tabNameTooLong]
  ])('rejects invalid tab name %s', (name, message) => {
    const result = zPaymentDetailsUpdateSchema.safeParse({
      tabs: [{ name, content }],
      pdfFile: null
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(message);
  });

  it('rejects an invalid persisted order', () => {
    const result = zPaymentDetailsSchema.safeParse({
      tabs: [{ name: 'UAH', content, order: 1.5 }],
      pdfFile: null
    });

    expect(result.success).toBe(false);
  });

  it('rejects unsupported Tiptap marks', () => {
    const result = zPaymentDetailsUpdateSchema.safeParse({
      tabs: [
        {
          name: 'UAH',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Details', marks: [{ type: 'link' }] }]
              }
            ]
          }
        }
      ],
      pdfFile: null
    });

    expect(result.success).toBe(false);
  });

  it.each([
    [{ filename: 'payment-details.docx', url: 'https://example.com/file', mimeType: 'application/pdf' }],
    [{ filename: 'payment-details.pdf', url: 'https://example.com/file', mimeType: 'text/plain' }]
  ])('rejects a non-PDF payment details file', (file) => {
    const result = zPaymentDetailsUpdateSchema.safeParse({
      tabs: [{ name: 'UAH', content }],
      pdfFile: file
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(PAYMENT_DETAILS_MESSAGES.pdfInvalidType);
  });
});
