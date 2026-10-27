import z from 'zod';

import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import { TipTapDocSchema } from '~/validators/tiptap.schema';

const paymentDetailsTabSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, PAYMENT_DETAILS_MESSAGES.tabNameRequired)
    .max(40, PAYMENT_DETAILS_MESSAGES.tabNameTooLong),
  content: TipTapDocSchema,
  order: z.number().int().min(0)
});

const pdfFileSchema = z
  .object({
    filename: z.string().trim().min(1),
    url: z.string().trim().min(1),
    mimeType: z.string().trim().min(1)
  })
  .refine((file) => file.mimeType === 'application/pdf' && file.filename.toLowerCase().endsWith('.pdf'), {
    message: PAYMENT_DETAILS_MESSAGES.pdfInvalidType
  });

export const zPaymentDetailsSchema = z
  .object({
    tabs: z.array(paymentDetailsTabSchema).min(1, PAYMENT_DETAILS_MESSAGES.atLeastOneTabRequired),
    pdfFile: pdfFileSchema.optional().nullable()
  })
  .superRefine(({ tabs }, ctx) => {
    const tabNames = tabs.map((tab) => tab.name.toLowerCase());

    if (new Set(tabNames).size !== tabNames.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['tabs'],
        message: PAYMENT_DETAILS_MESSAGES.duplicateTabNames
      });
    }
  });

export const paymentDetailsTabInputSchema = paymentDetailsTabSchema.omit({ order: true });
