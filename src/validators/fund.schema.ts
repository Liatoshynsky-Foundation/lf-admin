import z from 'zod';

import { FUND_VALIDATION_MESSAGES } from '~/constants/fund';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export const zFundSchema = z.object({
  fundNumber: z
    .int({
      error: (issue) => {
        if (issue.code === 'invalid_type') {
          if (issue.input === undefined || issue.input === null) {
            return { message: FUND_VALIDATION_MESSAGES.numberRequired };
          }
          return { message: FUND_VALIDATION_MESSAGES.numberInvalid };
        }
        return undefined;
      }
    })
    .positive({ message: FUND_VALIDATION_MESSAGES.numberInvalid }),

  name: z.object({
    uk: z
      .string()
      .trim()
      .min(1, { message: FUND_VALIDATION_MESSAGES.nameRequired })
      .max(40, { message: FUND_VALIDATION_MESSAGES.nameMaxLength }),
    en: z
      .string()
      .trim()
      .min(1, { message: FUND_VALIDATION_MESSAGES.nameRequired })
      .max(40, { message: FUND_VALIDATION_MESSAGES.nameMaxLength })
  }),

  documentCreationDate: z.object({
    uk: z
      .string()
      .trim()
      .min(1, { message: FUND_VALIDATION_MESSAGES.documentCreationDateRequired })
      .max(150, { message: FUND_VALIDATION_MESSAGES.documentCreationDateMaxLength }),
    en: z
      .string()
      .trim()
      .min(1, { message: FUND_VALIDATION_MESSAGES.documentCreationDateRequired })
      .max(150, { message: FUND_VALIDATION_MESSAGES.documentCreationDateMaxLength })
  }),

  chronologicalBoundaries: z
    .object({
      uk: z
        .string()
        .trim()
        .max(150, { message: FUND_VALIDATION_MESSAGES.chronologicalBoundariesMaxLength }),
      en: z
        .string()
        .trim()
        .max(150, { message: FUND_VALIDATION_MESSAGES.chronologicalBoundariesMaxLength })
    })
    .optional(),

  organizationForm: z
    .object({
      uk: z
        .string()
        .trim()
        .max(150, { message: FUND_VALIDATION_MESSAGES.organizationFormMaxLength }),
      en: z
        .string()
        .trim()
        .max(150, { message: FUND_VALIDATION_MESSAGES.organizationFormMaxLength })
    })
    .optional(),

  description: z
    .object({
      uk: z.string().trim().max(1000, { message: FUND_VALIDATION_MESSAGES.descriptionMaxLength }),
      en: z.string().trim().max(1000, { message: FUND_VALIDATION_MESSAGES.descriptionMaxLength })
    })
    .optional(),

  status: z.enum(BaseContentStatuses).default(BaseContentStatuses.Hidden)
});


export const zFundUpdateSchema = zFundSchema.partial().extend({
  status: z.enum(BaseContentStatuses).optional()
});