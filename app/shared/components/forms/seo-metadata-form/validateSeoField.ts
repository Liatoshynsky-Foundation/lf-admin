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
type SeoLengthField = Exclude<SeoField, 'canonicalUrl'>;

const lengthLimits: Record<SeoLengthField, LengthLimit> = {
  title: META_TITLE_LENGTH,
  description: META_DESCRIPTION_LENGTH,
  keywords: META_KEYWORDS_LENGTH,
  altText: META_ALT_TEXT_LENGTH
};

const maxLengthErrors: Record<SeoLengthField, SeoFieldValidationError> = {
  title: 'maxLength',
  description: 'descriptionMaxLength',
  keywords: 'keywordsMaxLength',
  altText: 'altTextMaxLength'
};

const validateLength = (field: SeoLengthField, value: string): SeoFieldValidationError => {
  const limits = lengthLimits[field];
  if (value.length < limits.min) return 'minLength';
  if (value.length > limits.max) return maxLengthErrors[field];
  return '';
};

const validateCanonicalUrl = (value: string): SeoFieldValidationError => {
  if (!value) return '';

  try {
    new URL(value);
    return '';
  } catch {
    return 'invalidUrl';
  }
};

const validateEmptyValue = (
  field: SeoField,
  required: boolean
): SeoFieldValidationError => {
  if (field === 'keywords') return '';
  if (field === 'title' && required) return 'minLength';
  return required ? 'required' : '';
};

const validateKeywords = (value: string): SeoFieldValidationError =>
  value.split(',').some((word) => !word.trim()) ? 'keywords' : '';

export interface SeoFieldValidationOptions {
  readonly required?: boolean;
}

export const validateSeoField = (
  field: SeoField,
  value: string,
  { required = false }: SeoFieldValidationOptions = {}
): SeoFieldValidationError => {
  if (field === 'canonicalUrl') return validateCanonicalUrl(value);

  const trimmed = value.trim();
  if (!trimmed) return validateEmptyValue(field, required);

  const lengthError = validateLength(field, trimmed);
  if (lengthError) return lengthError;

  if (field === 'keywords') return validateKeywords(trimmed);

  return '';
};
