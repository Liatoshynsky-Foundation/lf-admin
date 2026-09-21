import z from 'zod';

import { RESEARCH_VALIDATION_MESSAGES } from '~/constants/research';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const researchWorkVisibilityStatuses = [
  BaseContentStatuses.Published,
  BaseContentStatuses.Hidden
] as const;

const requiredString = (requiredMessage: string, maxLength: number, maxLengthMessage: string) =>
  z.string().trim().min(1, { message: requiredMessage }).max(maxLength, { message: maxLengthMessage });

const pdfFileSchema = z
  .object({
    filename: z.string().trim().min(1),
    url: z.string().trim().min(1),
    mimeType: z.string().trim().min(1)
  })
  .refine(
    (file) => file.mimeType === 'application/pdf' && file.filename.toLowerCase().endsWith('.pdf'),
    { message: RESEARCH_VALIDATION_MESSAGES.pdfInvalidType }
  );

const optionalUrlSchema = z
  .union([
    z.literal(''),
    z.null(),
    z
      .string()
      .trim()
      .pipe(z.url({ error: RESEARCH_VALIDATION_MESSAGES.urlInvalid }))
  ])
  .optional()
  .transform((value) => (value === '' ? null : value));

const optionalKeywordsSchema = z
  .union([
    z.literal(''),
    z.null(),
    z.string().trim().max(250, { message: RESEARCH_VALIDATION_MESSAGES.keywordsMaxLength })
  ])
  .optional()
  .transform((value) => (value === '' ? null : value));

export const zResearchWorkSchema = z.object({
  bibliographicDescription: requiredString(
    RESEARCH_VALIDATION_MESSAGES.bibliographicDescriptionRequired,
    250,
    RESEARCH_VALIDATION_MESSAGES.bibliographicDescriptionMaxLength
  ),

  author: requiredString(
    RESEARCH_VALIDATION_MESSAGES.authorRequired,
    150,
    RESEARCH_VALIDATION_MESSAGES.authorMaxLength
  ),

  year: requiredString(
    RESEARCH_VALIDATION_MESSAGES.yearRequired,
    150,
    RESEARCH_VALIDATION_MESSAGES.yearMaxLength
  ),

  keywords: optionalKeywordsSchema,

  pdfFile: pdfFileSchema.nullable().optional(),

  url: optionalUrlSchema,

  status: z.enum(researchWorkVisibilityStatuses).default(BaseContentStatuses.Published),

  publishedAt: z.iso.datetime().nullable().optional()
});

export const zResearchWorkUpdateSchema = zResearchWorkSchema.partial().extend({
  pdfFile: pdfFileSchema.nullable().optional(),
  url: optionalUrlSchema,
  keywords: optionalKeywordsSchema,
  status: z.enum(researchWorkVisibilityStatuses).optional(),
  publishedAt: z.iso.datetime().nullable().optional()
});

export const zResearchWorkStatusSchema = z.object({
  status: z.enum(researchWorkVisibilityStatuses)
});
