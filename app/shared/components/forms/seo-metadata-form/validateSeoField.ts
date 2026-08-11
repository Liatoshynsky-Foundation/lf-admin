import {
  META_ALT_TEXT_LENGTH,
  META_DESCRIPTION_LENGTH,
  META_KEYWORDS_LENGTH,
  META_TITLE_LENGTH
} from '~/constants/publications';

export type SeoField = 'title' | 'description' | 'keywords' | 'canonicalUrl' | 'altText';

export type SeoFieldValidationError =
  | ''
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'descriptionMaxLength'
  | 'keywordsMaxLength'
  | 'altTextMaxLength'
  | 'invalidUrl'
  | 'keywords';

type LengthLimit = { min: number; max: number };

const lengthLimits: Partial<Record<SeoField, LengthLimit>> = {
  title: META_TITLE_LENGTH,
  description: META_DESCRIPTION_LENGTH,
  keywords: META_KEYWORDS_LENGTH,
  altText: META_ALT_TEXT_LENGTH
};

const maxLengthErrors: Partial<Record<SeoField, SeoFieldValidationError>> = {
  title: 'maxLength',
  description: 'descriptionMaxLength',
  keywords: 'keywordsMaxLength',
  altText: 'altTextMaxLength'
};

const validateLength = (field: SeoField, value: string): SeoFieldValidationError => {
  const limits = lengthLimits[field];
  if (!limits) return '';
  if (value.length < limits.min) return 'minLength';
  if (value.length > limits.max) return maxLengthErrors[field] ?? 'maxLength';
  return '';
};

export interface SeoFieldValidationOptions {
  readonly required?: boolean;
}

export const validateSeoField = (
  field: SeoField,
  value: string,
  { required = false }: SeoFieldValidationOptions = {}
): SeoFieldValidationError => {
  if (field === 'canonicalUrl') {
    if (!value) return '';
    try {
      new URL(value);
      return '';
    } catch {
      return 'invalidUrl';
    }
  }

  const trimmed = value.trim();
  if (!trimmed) {
    if (field === 'keywords') return '';
    if (field === 'title' && required) return 'minLength';
    return required ? 'required' : '';
  }

  const lengthError = validateLength(field, trimmed);
  if (lengthError) return lengthError;

  if (field === 'keywords' && trimmed.split(',').some((word) => !word.trim())) return 'keywords';

  return '';
};
