import z from 'zod';

import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';

const paymentDetailsTabSchema = z.object({
  name: z.string().trim().min(1).max(40), // add validation messages
  content: z.unknown() // replace with tiptap content schema tomorrow
});

const pdfFieSchema = z
  .object({
    filename: z.string().trim().min(1),
    url: z.string().trim().min(1),
    mimeType: z.string().trim().min(1)
  })
  .refine((file) => file.mimeType === 'application/pdf' && file.filename.toLowerCase().endsWith('.pdf'), {
    message: PAYMENT_DETAILS_MESSAGES.pdfInvalidType
  });

export const zPaymentDetailsSchema = z.object({
  tabs: z.array(paymentDetailsTabSchema).min(1),
  pdfFile: pdfFieSchema.optional().nullable()
});
