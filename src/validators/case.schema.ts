import type { JSONContent } from '@tiptap/core';
import z from 'zod';

import { CASE_VALIDATION_MESSAGES } from '~/constants/case';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const positiveIntSchema = (requiredMessage: string, invalidMessage: string) =>
  z
    .int({
      error: (issue) => {
        if (issue.code === 'invalid_type') {
          if (issue.input === undefined || issue.input === null) {
            return { message: requiredMessage };
          }
          return { message: invalidMessage };
        }
        return undefined;
      }
    })
    .positive({ message: invalidMessage });

const requiredLocalizedString = (requiredMessage: string, maxLength: number, maxLengthMessage: string) =>
  z.object({
    uk: z.string().trim().min(1, { message: requiredMessage }).max(maxLength, { message: maxLengthMessage }),
    en: z.string().trim().min(1, { message: requiredMessage }).max(maxLength, { message: maxLengthMessage })
  });

const jsonContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z.object({
    type: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(jsonContentSchema).optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).optional()
        })
      )
      .optional(),
    text: z.string().optional()
  })
);

const optionalRichTextSchema = z
  .object({
    uk: jsonContentSchema.nullable().optional(),
    en: jsonContentSchema.nullable().optional()
  })
  .nullable()
  .optional();

const pdfFileSchema = z
  .object({
    filename: z.string().trim().min(1),
    url: z.string().trim().min(1),
    mimeType: z.string().trim().min(1)
  })
  .refine((file) => file.mimeType === 'application/pdf' && file.filename.toLowerCase().endsWith('.pdf'), {
    message: CASE_VALIDATION_MESSAGES.pdfInvalidType
  });

export const zCaseSchema = z.object({
  fundId: z.string().trim().min(1, { message: CASE_VALIDATION_MESSAGES.fundIdRequired }),

  descriptionNumber: positiveIntSchema(
    CASE_VALIDATION_MESSAGES.descriptionNumberRequired,
    CASE_VALIDATION_MESSAGES.descriptionNumberInvalid
  ),

  caseNumber: positiveIntSchema(
    CASE_VALIDATION_MESSAGES.caseNumberRequired,
    CASE_VALIDATION_MESSAGES.caseNumberInvalid
  ),

  caseName: requiredLocalizedString(
    CASE_VALIDATION_MESSAGES.caseNameRequired,
    150,
    CASE_VALIDATION_MESSAGES.caseNameMaxLength
  ),

  caseDate: requiredLocalizedString(
    CASE_VALIDATION_MESSAGES.caseDateRequired,
    150,
    CASE_VALIDATION_MESSAGES.caseDateMaxLength
  ),

  sheetsNumber: positiveIntSchema(
    CASE_VALIDATION_MESSAGES.sheetsNumberRequired,
    CASE_VALIDATION_MESSAGES.sheetsNumberInvalid
  ),

  caseDescriptions: requiredLocalizedString(
    CASE_VALIDATION_MESSAGES.caseDescriptionsRequired,
    300,
    CASE_VALIDATION_MESSAGES.caseDescriptionsMaxLength
  ),

  detailedCaseDescription: optionalRichTextSchema,
  pdfFile: pdfFileSchema.nullable().optional(),

  status: z.enum(BaseContentStatuses).default(BaseContentStatuses.Hidden)
});

export const zCaseUpdateSchema = zCaseSchema
  .omit({ detailedCaseDescription: true })
  .partial()
  .extend({
    detailedCaseDescription: optionalRichTextSchema,
    pdfFile: pdfFileSchema.nullable().optional(),
    status: z.enum(BaseContentStatuses).optional()
  });
