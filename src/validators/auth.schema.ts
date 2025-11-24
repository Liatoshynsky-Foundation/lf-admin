import { z } from 'zod';

import { errors } from '~/back-constants/errors';

export const zEmailSchema = z
  .string()
  .trim()
  .min(1, errors.EMAIL_REQUIRED)
  .email(errors.INVALID_EMAIL_FORMAT)
  .max(254, errors.EMAIL_TOO_LONG)
  .toLowerCase();
