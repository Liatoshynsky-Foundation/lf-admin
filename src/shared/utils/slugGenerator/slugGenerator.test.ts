import { generateUniqueSlug } from './slugGenerator';
import { utilsErrors } from '~/back-constants/errors';

describe('generateUniqueSlug', () => {
  const createMockCheckExists = (exists: boolean = false) => jest.fn().mockResolvedValue(exists);

  const expectSlugGeneration = async (
    title: string,
    expectedSlug: string,
    options: { checkExists?: jest.Mock; slugifyOptions?: any; fallbackSlug?: string; maxAttempts?: number } = {}
  ) => {
    const checkExists = options.checkExists || createMockCheckExists();
    const slug = await generateUniqueSlug(title, { checkExists, ...options });
    expect(slug).toBe(expectedSlug);
    return { slug, checkExists };
  };

  describe('basic slug generation', () => {
    it.each([
      ['My Article Title', 'my-article-title'],
      ['Hello @ World! #2025', 'hello-world-2025'],
      ['Привіт Світ', 'privit-svit'],
      ['  Spaced Out  ', 'spaced-out'],
      ['a', 'a'],
      ['Article 123', 'article-123'],
      ['Multiple    Spaces    Here', 'multiple-spaces-here']
    ])('should generate slug "%s" → "%s"', async (title, expected) => {
      await expectSlugGeneration(title, expected);
    });
  });

  describe('uniqueness handling', () => {
    it('should append -1 if base slug exists', async () => {
      const checkExists = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      await expectSlugGeneration('My Article', 'my-article-1', { checkExists });

      expect(checkExists).toHaveBeenCalledWith('my-article');
      expect(checkExists).toHaveBeenCalledWith('my-article-1');
      expect(checkExists).toHaveBeenCalledTimes(2);
    });

    it('should increment counter until finding unique slug', async () => {
      const checkExists = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await expectSlugGeneration('Popular Title', 'popular-title-3', { checkExists });
      expect(checkExists).toHaveBeenCalledTimes(4);
    });

    it('should handle duplicate titles consistently', async () => {
      const existingSlugs = new Set<string>();
      const checkExists = jest.fn().mockImplementation(async (slug: string) => existingSlugs.has(slug));

      const results = ['same-title', 'same-title-1', 'same-title-2'];

      for (const expected of results) {
        const { slug } = await expectSlugGeneration('Same Title', expected, { checkExists });
        existingSlugs.add(slug);
      }
    });
  });

  describe('custom options', () => {
    it.each([
      ['respect custom slugify options', 'Test Title', { lower: false }, 'Test-Title'],
      ['allow custom locale', 'Ä, Ö, Ü', { locale: 'de' }, /[a-z-]/],
      ['handle strict mode', 'Test & Title', { strict: false }, /test.*title/]
    ])('should %s', async (_, title, slugifyOptions, expected) => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug(title, { checkExists, slugifyOptions });

      if (expected instanceof RegExp) {
        expect(slug).toMatch(expected);
      } else {
        expect(slug).toBe(expected);
      }
    });
  });

  describe('edge cases', () => {
    it.each([
      ['very long titles', 'A'.repeat(300), 'a'.repeat(300)],
      ['titles with only special characters', '!@#$%^&*()', 'dollarpercentand']
    ])('should handle %s', async (_, title, expected) => {
      await expectSlugGeneration(title, expected);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from checkExists', async () => {
      const checkExists = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(generateUniqueSlug('Test', { checkExists })).rejects.toThrow('Database error');
    });
  });

  describe('validation', () => {
    it.each([
      ['empty title', ''],
      ['null title', null],
      ['undefined title', undefined],
      ['numeric title', 123]
    ])('should throw error for %s', async (_, title) => {
      const checkExists = jest.fn();
      // @ts-expect-error Testing invalid input
      await expect(generateUniqueSlug(title, { checkExists })).rejects.toThrow(utilsErrors.EMPTY_TITLE_FOR_SLUG);
      expect(checkExists).not.toHaveBeenCalled();
    });

    it.each([
      ['default fallback', '---', undefined, 'untitled'],
      ['custom fallback', '!!!', 'default-item', 'default-item']
    ])('should use %s when title produces empty slug', async (_, title, fallbackSlug, expected) => {
      await expectSlugGeneration(title, expected, { fallbackSlug });
    });

    it('should throw error when fallback is explicitly set to empty and slug is empty', async () => {
      const checkExists = jest.fn();
      await expect(generateUniqueSlug('!!!', { checkExists, fallbackSlug: '' })).rejects.toThrow(
        utilsErrors.NO_BASE_SLUG_AVAILABLE
      );
    });
  });

  describe('normalization', () => {
    it.each([
      ['multiple consecutive hyphens', 'Test---Multiple--Hyphens', 'test-multiple-hyphens'],
      ['leading hyphens', '---Test', 'test'],
      ['trailing hyphens', 'Test---', 'test']
    ])('should normalize %s', async (_, title, expected) => {
      await expectSlugGeneration(title, expected);
    });

    it('should normalize slugs with suffix numbers', async () => {
      const checkExists = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      await expectSlugGeneration('Test---Title', 'test-title-1', { checkExists });
    });
  });

  describe('max attempts', () => {
    it.each([
      [5, 6],
      [3, 4]
    ])('should throw error when max attempts (%i) is reached', async (maxAttempts, expectedCalls) => {
      const checkExists = createMockCheckExists(true);
      await expect(generateUniqueSlug('Test', { checkExists, maxAttempts })).rejects.toThrow(
        utilsErrors.SLUG_GENERATION_ERROR
      );
      expect(checkExists).toHaveBeenCalledTimes(expectedCalls);
    });

    it('should find unique slug within max attempts', async () => {
      const checkExists = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await expectSlugGeneration('Test', 'test-3', { checkExists, maxAttempts: 10 });
      expect(checkExists).toHaveBeenCalledTimes(4);
    });
  });
});
