import z from 'zod';

import { BaseContentStatuses } from '~/types/enums/common.enums';

export const zFondSchema = z.object({
  fondNumber: z
    .int({
      error: (issue) => {
        if (issue.code === 'invalid_type') {
          if (issue.input === undefined || issue.input === null) {
            return { message: 'Номер фонду є обов’язковим.' };
          }
          return { message: 'Номер фонду має бути цілим позитивним числом.' };
        }
        return undefined;
      }
    })
    .positive({ message: 'Номер фонду має бути цілим позитивним числом.' }),

  name: z.object({
    uk: z
      .string()
      .trim()
      .min(1, { message: 'Назва фонду є обов’язковою. Назва фонду повинна мати мінімум одну літеру' })
      .max(40, { message: 'Назва не може перевищувати 40 символів.' }),
    en: z
      .string()
      .trim()
      .min(1, { message: 'Назва фонду є обов’язковою. Назва фонду повинна мати мінімум одну літеру' })
      .max(40, { message: 'Назва не може перевищувати 40 символів.' })
  }),

  documentCreationDate: z.object({
    uk: z
      .string()
      .trim()
      .min(1, { message: 'Дати утворення документів є обов’язковими. Дати утворення документів повинні мати мінімум одну літеру' })
      .max(150, { message: 'Значення не може перевищувати 150 символів.' }),
    en: z
      .string()
      .trim()
      .min(1, { message: 'Дати утворення документів є обов’язковими. Дати утворення документів повинні мати мінімум одну літеру' })
      .max(150, { message: 'Значення не може перевищувати 150 символів.' })
  }),

  chronologicalBoundaries: z
    .object({
      uk: z
        .string()
        .trim()
        .max(150, { message: 'Значення не може перевищувати 150 символів.' }),
      en: z
        .string()
        .trim()
        .max(150, { message: 'Значення не може перевищувати 150 символів.' })
    })
    .optional(),

  organizationForm: z
    .object({
      uk: z
        .string()
        .trim()
        .max(150, { message: 'Значення не може перевищувати 150 символів.' }),
      en: z
        .string()
        .trim()
        .max(150, { message: 'Значення не може перевищувати 150 символів.' })
    })
    .optional(),

  description: z
    .object({
      uk: z.record(z.any(), z.any()),
      en: z.record(z.any(), z.any())
    })
    .optional(),

  status: z.enum(BaseContentStatuses).default(BaseContentStatuses.Hidden)
});


export const zFondUpdateSchema = zFondSchema.partial().extend({
  status: z.enum(BaseContentStatuses).optional()
});