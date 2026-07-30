import z from 'zod';

import { FOND_VALIDATION_MESSAGES } from '~/constants/fond';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export const zFondSchema = z.object({
  fondNumber: z
    .int({
      error: (issue) => {
        if (issue.code === 'invalid_type') {
          if (issue.input === undefined || issue.input === null) {
            return { message: FOND_VALIDATION_MESSAGES.numberRequired };
          }
          return { message: FOND_VALIDATION_MESSAGES.numberInvalid };
        }
        return undefined;
      }
    })
    .positive({ message: FOND_VALIDATION_MESSAGES.numberInvalid }),

  name: z.object({
    uk: z
      .string()
      .trim()
      .min(1, { message: FOND_VALIDATION_MESSAGES.nameRequired })
      .max(40, { message: FOND_VALIDATION_MESSAGES.nameMaxLength }),
    en: z
      .string()
      .trim()
      .min(1, { message: FOND_VALIDATION_MESSAGES.nameRequired })
      .max(40, { message: FOND_VALIDATION_MESSAGES.nameMaxLength })
  }),

  documentCreationDate: z.object({
    uk: z
      .string()
      .trim()
      .min(1, { message: FOND_VALIDATION_MESSAGES.documentCreationDateRequired })
      .max(150, { message: FOND_VALIDATION_MESSAGES.documentCreationDateMaxLength }),
    en: z
      .string()
      .trim()
      .min(1, { message: FOND_VALIDATION_MESSAGES.documentCreationDateRequired })
      .max(150, { message: FOND_VALIDATION_MESSAGES.documentCreationDateMaxLength })
  }),

  chronologicalBoundaries: z
    .object({
      uk: z
        .string()
        .trim()
        .max(150, { message: FOND_VALIDATION_MESSAGES.chronologicalBoundariesMaxLength }),
      en: z
        .string()
        .trim()
        .max(150, { message: FOND_VALIDATION_MESSAGES.chronologicalBoundariesMaxLength })
    })
    .optional(),

  organizationForm: z
    .object({
      uk: z
        .string()
        .trim()
        .max(150, { message: FOND_VALIDATION_MESSAGES.organizationFormMaxLength }),
      en: z
        .string()
        .trim()
        .max(150, { message: FOND_VALIDATION_MESSAGES.organizationFormMaxLength })
    })
    .optional(),

  description: z
    .object({
      uk: z.string().trim().max(1000, { message: FOND_VALIDATION_MESSAGES.descriptionMaxLength }),
      en: z.string().trim().max(1000, { message: FOND_VALIDATION_MESSAGES.descriptionMaxLength })
    })
    .optional(),

  status: z.enum(BaseContentStatuses).default(BaseContentStatuses.Hidden)
});


export const zFondUpdateSchema = zFondSchema.partial().extend({
  status: z.enum(BaseContentStatuses).optional()
});