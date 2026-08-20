import { validateSeoField } from './validateSeoField';
import {
  META_ALT_TEXT_LENGTH,
  META_DESCRIPTION_LENGTH,
  META_KEYWORDS_LENGTH,
  META_TITLE_LENGTH
} from '~/constants/publications';

const SEO_FIELD = {
  title: 'title',
  description: 'description',
  keywords: 'keywords',
  altText: 'altText',
  canonicalUrl: 'canonicalUrl'
} as const;

const SEO_LENGTH_FIELDS = [
  [SEO_FIELD.title, META_TITLE_LENGTH],
  [SEO_FIELD.description, META_DESCRIPTION_LENGTH],
  [SEO_FIELD.keywords, META_KEYWORDS_LENGTH],
  [SEO_FIELD.altText, META_ALT_TEXT_LENGTH]
] as const;

const INVALID_KEYWORDS = ['one, ,two', 'one,two,'] as const;
const SEO_ERROR = {
  required: 'required',
  minLength: 'minLength',
  keywords: 'keywords',
  invalidUrl: 'invalidUrl'
} as const;

const EMPTY_STRING = '';

describe('validateSeoField', () => {
  test.each(SEO_LENGTH_FIELDS)('accepts %s at its configured boundaries', (field, limits) => {
    expect(validateSeoField(field, 'a'.repeat(limits.min))).toBe(EMPTY_STRING);
    expect(validateSeoField(field, 'a'.repeat(limits.max))).toBe(EMPTY_STRING);
    expect(validateSeoField(field, 'a'.repeat(limits.max + 1))).toMatch(/MaxLength|maxLength/);
  });

  it('allows empty optional fields but reports required fields', () => {
    expect(validateSeoField(SEO_FIELD.title, EMPTY_STRING, { required: false })).toBe(EMPTY_STRING);
    expect(validateSeoField(SEO_FIELD.description, EMPTY_STRING, { required: false })).toBe(EMPTY_STRING);
    expect(validateSeoField(SEO_FIELD.altText, '   ', { required: false })).toBe(EMPTY_STRING);
    expect(validateSeoField(SEO_FIELD.keywords, EMPTY_STRING, { required: true })).toBe(EMPTY_STRING);
    expect(validateSeoField(SEO_FIELD.title, EMPTY_STRING, { required: true })).toBe(SEO_ERROR.minLength);
    expect(validateSeoField(SEO_FIELD.description, EMPTY_STRING, { required: true })).toBe(SEO_ERROR.required);
    expect(validateSeoField(SEO_FIELD.altText, EMPTY_STRING, { required: true })).toBe(SEO_ERROR.required);
  });

  it('validates keyword formatting after length validation', () => {
    expect(validateSeoField(SEO_FIELD.keywords, INVALID_KEYWORDS[0])).toBe(SEO_ERROR.keywords);
    expect(validateSeoField(SEO_FIELD.keywords, 'one, two')).toBe(EMPTY_STRING);
    expect(validateSeoField(SEO_FIELD.keywords, INVALID_KEYWORDS[1])).toBe(SEO_ERROR.keywords);
  });

  it('validates canonical URLs and allows an empty value', () => {
    expect(validateSeoField(SEO_FIELD.canonicalUrl, EMPTY_STRING)).toBe(EMPTY_STRING);
    expect(validateSeoField(SEO_FIELD.canonicalUrl, 'https://example.com/page')).toBe(EMPTY_STRING);
    expect(validateSeoField(SEO_FIELD.canonicalUrl, 'not-a-url')).toBe(SEO_ERROR.invalidUrl);
  });
});
