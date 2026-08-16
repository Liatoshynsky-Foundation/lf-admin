import { z } from 'zod';

export const compositionTitleSchema = z
  .string()
  .trim()
  .min(1, 'Введіть назву композиції.')
  .min(2, 'Введіть щонайменше 2 символи.')
  .max(250, 'Назва не може перевищувати 250 символів.');

export const compositionGenreSchema = z
  .string()
  .trim()
  .refine((genre) => !genre || genre.length >= 2, 'Введіть щонайменше 2 символи.')
  .max(150, 'Жанр не може перевищувати 150 символів.');

export const compositionYearSchema = z
  .string()
  .trim()
  .refine((year) => !year || /^\d{4}$/.test(year), 'Введіть коректну дату.');
