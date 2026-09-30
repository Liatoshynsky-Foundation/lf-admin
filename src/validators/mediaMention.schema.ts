import { z } from 'zod';

export const mediaMentionUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((url) => {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  });
