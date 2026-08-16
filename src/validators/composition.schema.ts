import { z } from 'zod';

export const compositionTitleSchema = z
  .string()
  .trim()
  .min(1, 'Введіть назву композиції.')
  .min(2, 'Введіть щонайменше 2 символи.')
  .max(250, 'Назва не може перевищувати 250 символів.');
