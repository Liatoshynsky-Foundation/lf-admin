import { z } from 'zod';

import { COMPOSITION_VALIDATION_MESSAGES } from '~/constants/opus';

export const compositionTitleSchema = z
  .string()
  .trim()
  .min(1, COMPOSITION_VALIDATION_MESSAGES.titleRequired)
  .min(2, COMPOSITION_VALIDATION_MESSAGES.titleTooShort)
  .max(250, COMPOSITION_VALIDATION_MESSAGES.titleTooLong);

export const compositionGenreSchema = z
  .string()
  .trim()
  .refine((genre) => !genre || genre.length >= 2, COMPOSITION_VALIDATION_MESSAGES.genreTooShort)
  .max(150, COMPOSITION_VALIDATION_MESSAGES.genreTooLong);

export const compositionYearSchema = z
  .string()
  .trim()
  .refine((year) => !year || /^\d{4}$/.test(year), COMPOSITION_VALIDATION_MESSAGES.yearInvalid);
