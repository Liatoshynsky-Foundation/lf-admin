import { Types } from 'mongoose';

import type { DbPaymentDetails } from '../paymentDetailsRepository';
import type { UpdatePaymentDetailsInput } from '~/domain/repositories/PaymentDetailsRepository';

export const paymentDetailsContent = {
  type: 'doc' as const,
  content: [
    {
      type: 'paragraph' as const,
      content: [
        {
          type: 'text' as const,
          text: 'Payment details'
        }
      ]
    }
  ]
};

export const paymentDetailsPdfFile = {
  filename: 'payment-details.pdf',
  url: 'https://cdn.example.com/payment-details.pdf',
  mimeType: 'application/pdf'
};

export const paymentDetails: DbPaymentDetails = {
  _id: new Types.ObjectId('64b8f1e2c9e77a0012345678'),
  slug: 'payment-details',
  tabs: [
    {
      _id: new Types.ObjectId('64b8f1e2c9e77a0012345679'),
      name: 'UAH',
      content: paymentDetailsContent,
      order: 0
    },
    {
      _id: new Types.ObjectId('64b8f1e2c9e77a0012345680'),
      name: 'EUR',
      content: paymentDetailsContent,
      order: 1
    }
  ],
  pdfFile: paymentDetailsPdfFile,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z')
};

export const updatePaymentDetailsInput: UpdatePaymentDetailsInput = {
  tabs: [
    {
      id: paymentDetails.tabs[0]._id.toString(),
      name: 'UAH',
      content: paymentDetailsContent
    },
    {
      id: paymentDetails.tabs[1]._id.toString(),
      name: 'EUR',
      content: paymentDetailsContent
    }
  ],
  pdfFile: paymentDetailsPdfFile
};
