import { validateSeoField } from './validateSeoField';
import {
  META_ALT_TEXT_LENGTH,
  META_DESCRIPTION_LENGTH,
  META_KEYWORDS_LENGTH,
  META_TITLE_LENGTH
} from '~/constants/publications';

describe('validateSeoField', () => {
  test.each([
    ['title', META_TITLE_LENGTH],
    ['description', META_DESCRIPTION_LENGTH],
    ['keywords', META_KEYWORDS_LENGTH],
    ['altText', META_ALT_TEXT_LENGTH]
  ] as const)('accepts %s at its configured boundaries', (field, limits) => {
    expect(validateSeoField(field, 'a'.repeat(limits.min))).toBe('');
    expect(validateSeoField(field, 'a'.repeat(limits.max))).toBe('');
    expect(validateSeoField(field, 'a'.repeat(limits.max + 1))).toMatch(/MaxLength|maxLength/);
  });

  it('allows empty optional fields but reports required fields', () => {
    expect(validateSeoField('title', '', { required: false })).toBe('');
    expect(validateSeoField('description', '', { required: false })).toBe('');
    expect(validateSeoField('title', '', { required: true })).toBe('minLength');
    expect(validateSeoField('description', '', { required: true })).toBe('required');
    expect(validateSeoField('altText', '', { required: true })).toBe('required');
  });

  it('validates keyword formatting after length validation', () => {
    expect(validateSeoField('keywords', 'one, ,two')).toBe('keywords');
    expect(validateSeoField('keywords', 'one, two')).toBe('');
  });

  it('validates canonical URLs and allows an empty value', () => {
    expect(validateSeoField('canonicalUrl', '')).toBe('');
    expect(validateSeoField('canonicalUrl', 'https://example.com/page')).toBe('');
    expect(validateSeoField('canonicalUrl', 'not-a-url')).toBe('invalidUrl');
  });
});
