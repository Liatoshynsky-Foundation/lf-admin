import z from 'zod';

import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import { TipTapDocSchema } from '~/validators/tiptap.schema';

const withUniqueTabNames = <T extends z.ZodType<{ tabs: Array<{ name: string }> }>>(schema: T) => {
  return schema.superRefine(({ tabs }, ctx) => {
    const tabNames = tabs.map((tab) => tab.name.trim().toLowerCase());

    if (new Set(tabNames).size !== tabNames.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['tabs'],
        message: PAYMENT_DETAILS_MESSAGES.tabNameDuplicate
      });
    }
  });
};
const pdfFileSchema = z
  .object({
    filename: z.string().trim().min(1),
    url: z.string().trim().min(1),
    mimeType: z.string().trim().min(1)
  })
  .refine((file) => file.mimeType === 'application/pdf' && file.filename.toLowerCase().endsWith('.pdf'), {
    message: PAYMENT_DETAILS_MESSAGES.pdfInvalidType
  });

const paymentDetailsTabFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, PAYMENT_DETAILS_MESSAGES.tabNameRequired)
    .max(40, PAYMENT_DETAILS_MESSAGES.tabNameTooLong),
  content: TipTapDocSchema
});

const paymentDetailsTabSchema = paymentDetailsTabFieldsSchema.extend({
  order: z.number().int().min(0)
});

const paymentDetailsTabUpdateSchema = paymentDetailsTabFieldsSchema.extend({
  id: z.string().trim().min(1).optional()
});

export const zPaymentDetailsSchema = withUniqueTabNames(
  z.object({
    tabs: z.array(paymentDetailsTabSchema).min(1, PAYMENT_DETAILS_MESSAGES.atLeastOneTabRequired),
    pdfFile: pdfFileSchema.nullable()
  })
);

export const zPaymentDetailsUpdateSchema = withUniqueTabNames(
  z.object({
    tabs: z.array(paymentDetailsTabUpdateSchema).min(1, PAYMENT_DETAILS_MESSAGES.atLeastOneTabRequired),
    pdfFile: pdfFileSchema.nullable()
  })
);
