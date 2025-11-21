import slugify from 'slugify';

import { utilsErrors } from '~/back-constants/errors';

const DEFAULT_SLUGIFY_OPTIONS = {
  lower: true,
  strict: true,
  trim: true
} as const;

const MAX_ATTEMPTS = 100;

const DEFAULT_FALLBACK_SLUG = 'untitled';

type SlugGeneratorOptions = {
  checkExists: (slug: string) => Promise<boolean>;
  slugifyOptions?: {
    lower?: boolean;
    strict?: boolean;
    locale?: string;
    trim?: boolean;
  };
  maxAttempts?: number;
  fallbackSlug?: string;
};

function normalizeSlug(slug: string): string {
  const replaced = slug.replaceAll(/-+/g, '-');

  return replaced.replace(/^(?:(-+))|(?:(-+))$/g, '');
}

export async function generateUniqueSlug(title: string, options: SlugGeneratorOptions): Promise<string> {
  const {
    checkExists,
    slugifyOptions = {},
    maxAttempts = MAX_ATTEMPTS,
    fallbackSlug = DEFAULT_FALLBACK_SLUG
  } = options;

  if (!title || typeof title !== 'string') {
    throw new Error(utilsErrors.EMPTY_TITLE_FOR_SLUG);
  }

  const mergedOptions = {
    ...DEFAULT_SLUGIFY_OPTIONS,
    ...slugifyOptions
  };

  let baseSlug = slugify(title, mergedOptions);

  if (!baseSlug || baseSlug.trim() === '') {
    if (!fallbackSlug) {
      throw new Error(utilsErrors.NO_BASE_SLUG_AVAILABLE);
    }
    baseSlug = fallbackSlug;
  }

  baseSlug = normalizeSlug(baseSlug);

  if (!baseSlug) {
    throw new Error(utilsErrors.EMPTY_SLUG);
  }

  const exists = await checkExists(baseSlug);
  if (!exists) {
    return baseSlug;
  }

  let counter = 1;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const uniqueSlug = normalizeSlug(`${baseSlug}-${counter}`);

    const slugExists = await checkExists(uniqueSlug);
    if (!slugExists) {
      return uniqueSlug;
    }

    counter++;
    attempts++;
  }

  throw new Error(utilsErrors.UNABLE_GENERATE_UNIQUE_SLUG);
}
