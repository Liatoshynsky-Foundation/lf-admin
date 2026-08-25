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

const requiredLocalizedField = (requiredMessage: string, maxLength: number, maxLengthMessage: string) =>
  z.object({
    uk: z.string().trim().min(1, { message: requiredMessage }).max(maxLength, { message: maxLengthMessage }),
    en: z.string().trim().min(1, { message: requiredMessage }).max(maxLength, { message: maxLengthMessage })
  });

const pdfFileSchema = z
  .object({
    filename: z.string().trim().min(1),
    url: z.string().trim().min(1),
    mimeType: z.string().trim().min(1)
  })
  .refine(
    (file) => file.mimeType === 'application/pdf' && file.filename.toLowerCase().endsWith('.pdf'),
    { message: CASE_VALIDATION_MESSAGES.pdfInvalidType }
  );

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

  caseName: requiredLocalizedField(
    CASE_VALIDATION_MESSAGES.caseNameRequired,
    150,
    CASE_VALIDATION_MESSAGES.caseNameMaxLength
  ),

  caseDate: requiredLocalizedField(
    CASE_VALIDATION_MESSAGES.caseDateRequired,
    150,
    CASE_VALIDATION_MESSAGES.caseDateMaxLength
  ),

  sheetsNumber: positiveIntSchema(
    CASE_VALIDATION_MESSAGES.sheetsNumberRequired,
    CASE_VALIDATION_MESSAGES.sheetsNumberInvalid
  ),

  caseDescriptions: requiredLocalizedField(
    CASE_VALIDATION_MESSAGES.caseDescriptionsRequired,
    300,
    CASE_VALIDATION_MESSAGES.caseDescriptionsMaxLength
  ),

  detailedCaseDescription: z
    .object({
      uk: z.string().trim().max(1000, { message: CASE_VALIDATION_MESSAGES.detailedCaseDescriptionMaxLength }),
      en: z.string().trim().max(1000, { message: CASE_VALIDATION_MESSAGES.detailedCaseDescriptionMaxLength })
    })
    .optional(),

  pdfFile: pdfFileSchema.nullable().optional(),

  status: z.enum(BaseContentStatuses).default(BaseContentStatuses.Hidden)
});

export const zCaseUpdateSchema = zCaseSchema.partial().extend({
  status: z.enum(BaseContentStatuses).optional()
});
