import { z } from 'zod';

import { errors } from '~/back-constants/errors';

export const zEmailSchema = z
  .string()
  .trim()
  .min(1, errors.EMAIL_REQUIRED)
  .email(errors.INVALID_EMAIL_FORMAT)
  .max(254, errors.EMAIL_TOO_LONG)
  .toLowerCase();

export const zPasswordSchema = z
  .string()
  .min(10, 'Пароль має містити щонайменше 10 символів')
  .max(72, 'Максимальна довжина — 72 символи')
  .regex(/[A-Z]/, 'Пароль має містити щонайменше одну велику літеру')
  .regex(/\d/, 'Пароль має містити щонайменше одну цифру')
  .regex(/[^A-Za-z0-9]/, 'Пароль має містити щонайменше один спеціальний символ');
