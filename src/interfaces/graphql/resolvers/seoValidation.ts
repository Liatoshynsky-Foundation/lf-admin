import { GraphQLError } from 'graphql';

import { LocalizedImage, LocalizedString } from '~/domain/entities/BaseContent';
import { seoValidationErrors } from '~/src/constants/errors';

const LOCALES = ['uk', 'en'] as const;

const SEO_LENGTH_LIMITS = {
  title: { min: 2, max: 150 },
  description: { min: 2, max: 250 },
  keywords: { min: 2, max: 250 },
  altText: { min: 2, max: 250 }
} as const;

type SeoLengthField = keyof typeof SEO_LENGTH_LIMITS;

export type SeoLengthValidationInput = {
  title?: LocalizedString;
  description?: LocalizedString;
  keywords?: LocalizedString;
  coverImage?: LocalizedImage;
};

const throwBadUserInput = (message: string, fields: string[]): void => {
  if (fields.length === 0) return;

  throw new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      fields
    }
  });
};

type Locale = (typeof LOCALES)[number];

const getInvalidLocalizedFields = (
  value: LocalizedString | undefined,
  field: SeoLengthField,
  requiredLocales: readonly Locale[]
): string[] => {
  if (!value) return [];

  const { min, max } = SEO_LENGTH_LIMITS[field];

  return LOCALES.filter((locale) => {
    const localizedValue = value[locale];

    if (typeof localizedValue !== 'string') return false;

    const { length } = localizedValue.trim();

    if (length === 0) return requiredLocales.includes(locale);

    return length < min || length > max;
  }).map((locale) => `${field}.${locale}`);
};

const TITLE_REQUIRED_LOCALES = ['uk', 'en'] as const;
const DESCRIPTION_REQUIRED_LOCALES = ['uk'] as const;
const NO_REQUIRED_LOCALES = [] as const;

export const validateSeoLengths = ({
  title,
  description,
  keywords,
  coverImage
}: SeoLengthValidationInput): void => {
  throwBadUserInput(
    seoValidationErrors.TITLE_LENGTH_INVALID,
    getInvalidLocalizedFields(title, 'title', TITLE_REQUIRED_LOCALES)
  );
  throwBadUserInput(
    seoValidationErrors.DESCRIPTION_LENGTH_INVALID,
    getInvalidLocalizedFields(description, 'description', DESCRIPTION_REQUIRED_LOCALES)
  );
  throwBadUserInput(
    seoValidationErrors.KEYWORDS_LENGTH_INVALID,
    getInvalidLocalizedFields(keywords, 'keywords', NO_REQUIRED_LOCALES)
  );
  throwBadUserInput(
    seoValidationErrors.ALT_TEXT_LENGTH_INVALID,
    getInvalidLocalizedFields(coverImage?.alt, 'altText', NO_REQUIRED_LOCALES)
  );
};
