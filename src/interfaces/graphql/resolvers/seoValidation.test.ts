import { GraphQLError } from 'graphql';

import { validateSeoLengths } from './seoValidation';
import type { LocalizedImage } from '~/domain/entities/BaseContent';
import { seoValidationErrors } from '~/src/constants/errors';

const expectAltValidationError = (run: () => void, fields: string[]): void => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(GraphQLError);
    expect(error).toMatchObject({
      message: seoValidationErrors.ALT_TEXT_LENGTH_INVALID,
      extensions: {
        code: 'BAD_USER_INPUT',
        fields
      }
    });
    return;
  }

  throw new Error('Expected validateSeoLengths to throw');
};

describe('validateSeoLengths', () => {
  const validBase = {
    title: { uk: 'Заголовок', en: 'Title' },
    description: { uk: 'Опис', en: '' },
    keywords: { uk: '', en: '' }
  };

  const coverImage = (overrides: Partial<LocalizedImage> = {}): LocalizedImage => ({
    src: 'cover.jpg',
    alt: { uk: 'Альт', en: 'Alt' },
    caption: { uk: '', en: '' },
    ...overrides
  });

  it('does not require alt text when cover image src is missing', () => {
    expect(() =>
      validateSeoLengths({
        ...validBase,
        coverImage: coverImage({ src: '', alt: { uk: '', en: '' } })
      })
    ).not.toThrow();
  });

  it('does not require alt text when cover image src is whitespace only', () => {
    expect(() =>
      validateSeoLengths({
        ...validBase,
        coverImage: coverImage({ src: '   ', alt: { uk: '', en: '' } })
      })
    ).not.toThrow();
  });

  it('does not require alt text when cover image is omitted', () => {
    expect(() => validateSeoLengths(validBase)).not.toThrow();
  });

  it('requires alt text for both locales when cover image src is present', () => {
    expectAltValidationError(
      () =>
        validateSeoLengths({
          ...validBase,
          coverImage: coverImage({ alt: { uk: '', en: '' } })
        }),
      ['altText.uk', 'altText.en']
    );
  });

  it('rejects whitespace-only alt text when cover image src is present', () => {
    expectAltValidationError(
      () =>
        validateSeoLengths({
          ...validBase,
          coverImage: coverImage({ alt: { uk: '  ', en: 'Alt' } })
        }),
      ['altText.uk']
    );
  });

  it('rejects alt shorter than 2 characters when cover image src is present', () => {
    expectAltValidationError(
      () =>
        validateSeoLengths({
          ...validBase,
          coverImage: coverImage({ alt: { uk: 'A', en: 'Alt' } })
        }),
      ['altText.uk']
    );
  });

  it('accepts valid alt text when cover image src is present', () => {
    expect(() =>
      validateSeoLengths({
        ...validBase,
        coverImage: coverImage()
      })
    ).not.toThrow();
  });

  it('treats missing alt object as empty when cover image src is present', () => {
    expectAltValidationError(
      () =>
        validateSeoLengths({
          ...validBase,
          coverImage: { src: 'cover.jpg', caption: { uk: '', en: '' } } as LocalizedImage
        }),
      ['altText.uk', 'altText.en']
    );
  });
});
