import z from 'zod';

import { BaseContentStatuses } from '~/types/enums/common.enums';

export const zFondSchema = z.object({
  fondNumber: z.number().min(1),

  name: z.object({
    uk: z.string().trim().min(1).max(40),
    en: z.string().trim().min(1).max(40)
  }),

  documentCreationDate: z.object({
    uk: z.string().trim().min(1).max(150),
    en: z.string().trim().min(1).max(150)
  }),

  chronologicalBoundaries: z.object({
    uk: z.string().trim().min(1).max(150),
    en: z.string().trim().min(1).max(150)
  }).optional(),

  organizationForm: z.object({
    uk: z.string().trim().min(1).max(150),
    en: z.string().trim().min(1).max(150)
  }).optional(),

  description: z.object({
    uk: z.record(z.any(), z.any()),
    en: z.record(z.any(), z.any()),
  }).optional(),

  status: z.enum(BaseContentStatuses)
});