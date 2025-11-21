import { generateUniqueSlug } from './slugGenerator';
import { utilsErrors } from '~/back-constants/errors';

describe('generateUniqueSlug', () => {
  const createMockCheckExists = (exists: boolean = false) => jest.fn().mockResolvedValue(exists);

  describe('basic slug generation', () => {
    it('should generate a simple slug from a title', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('My Article Title', { checkExists });

      expect(slug).toBe('my-article-title');
      expect(checkExists).toHaveBeenCalledWith('my-article-title');
      expect(checkExists).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Hello @ World! #2025', { checkExists });

      expect(slug).toBe('hello-world-2025');
    });

    it('should handle unicode characters', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Привіт Світ', { checkExists });

      expect(slug).toBe('privit-svit');
    });

    it('should trim whitespace', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('  Spaced Out  ', { checkExists });

      expect(slug).toBe('spaced-out');
    });

    it('should handle empty or very short titles', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('a', { checkExists });

      expect(slug).toBe('a');
    });
  });

  describe('uniqueness handling', () => {
    it('should append -1 if base slug exists', async () => {
      const checkExists = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const slug = await generateUniqueSlug('My Article', { checkExists });

      expect(slug).toBe('my-article-1');
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

      const slug = await generateUniqueSlug('Popular Title', { checkExists });

      expect(slug).toBe('popular-title-3');
      expect(checkExists).toHaveBeenCalledTimes(4);
    });

    it('should handle duplicate titles consistently', async () => {
      const existingSlugs = new Set<string>();
      const checkExists = jest.fn().mockImplementation(async (slug: string) => {
        return existingSlugs.has(slug);
      });

      const slug1 = await generateUniqueSlug('Same Title', { checkExists });
      existingSlugs.add(slug1);
      expect(slug1).toBe('same-title');

      const slug2 = await generateUniqueSlug('Same Title', { checkExists });
      existingSlugs.add(slug2);
      expect(slug2).toBe('same-title-1');

      const slug3 = await generateUniqueSlug('Same Title', { checkExists });
      existingSlugs.add(slug3);
      expect(slug3).toBe('same-title-2');
    });
  });

  describe('custom options', () => {
    it('should respect custom slugify options', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Test Title', {
        checkExists,
        slugifyOptions: {
          lower: false
        }
      });

      expect(slug).toBe('Test-Title');
    });

    it('should allow custom locale', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Ä, Ö, Ü', {
        checkExists,
        slugifyOptions: {
          locale: 'de'
        }
      });

      expect(slug).toMatch(/[a-z-]/);
    });

    it('should handle strict mode', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Test & Title', {
        checkExists,
        slugifyOptions: {
          strict: false
        }
      });

      expect(slug).toContain('test');
      expect(slug).toContain('title');
    });
  });

  describe('edge cases', () => {
    it('should handle very long titles', async () => {
      const checkExists = createMockCheckExists();
      const longTitle = 'A'.repeat(300);
      const slug = await generateUniqueSlug(longTitle, { checkExists });

      expect(slug).toBe('a'.repeat(300));
    });

    it('should handle titles with only special characters', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('!@#$%^&*()', { checkExists });

      expect(slug).toBe('dollarpercentand');
    });

    it('should handle titles with numbers', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Article 123', { checkExists });

      expect(slug).toBe('article-123');
    });

    it('should handle titles with multiple consecutive spaces', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Multiple    Spaces    Here', { checkExists });

      expect(slug).toBe('multiple-spaces-here');
    });
  });

  describe('error handling', () => {
    it('should propagate errors from checkExists', async () => {
      const checkExists = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(generateUniqueSlug('Test', { checkExists })).rejects.toThrow('Database error');
    });
  });

  describe('validation', () => {
    it('should throw error for empty title', async () => {
      const checkExists = jest.fn();

      await expect(generateUniqueSlug('', { checkExists })).rejects.toThrow(utilsErrors.EMPTY_TITLE_FOR_SLUG);
      expect(checkExists).not.toHaveBeenCalled();
    });

    it('should throw error for non-string title', async () => {
      const checkExists = jest.fn();

      // @ts-expect-error Testing invalid input
      await expect(generateUniqueSlug(null, { checkExists })).rejects.toThrow(utilsErrors.EMPTY_TITLE_FOR_SLUG);

      // @ts-expect-error Testing invalid input
      await expect(generateUniqueSlug(undefined, { checkExists })).rejects.toThrow(utilsErrors.EMPTY_TITLE_FOR_SLUG);

      // @ts-expect-error Testing invalid input
      await expect(generateUniqueSlug(123, { checkExists })).rejects.toThrow(utilsErrors.EMPTY_TITLE_FOR_SLUG);
    });

    it('should use fallback slug when title produces empty slug', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('---', { checkExists });

      expect(slug).toBe('untitled');
    });

    it('should use custom fallback slug when provided', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('!!!', {
        checkExists,
        fallbackSlug: 'default-item'
      });

      expect(slug).toBe('default-item');
    });

    it('should throw error when fallback is explicitly set to empty and slug is empty', async () => {
      const checkExists = jest.fn();

      await expect(
        generateUniqueSlug('!!!', {
          checkExists,
          fallbackSlug: ''
        })
      ).rejects.toThrow(utilsErrors.NO_BASE_SLUG_AVAILABLE);
    });
  });

  describe('normalization', () => {
    it('should normalize multiple consecutive hyphens to single hyphen', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Test---Multiple--Hyphens', { checkExists });

      expect(slug).toBe('test-multiple-hyphens');
    });

    it('should remove leading hyphens', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('---Test', { checkExists });

      expect(slug).toBe('test');
    });

    it('should remove trailing hyphens', async () => {
      const checkExists = createMockCheckExists();
      const slug = await generateUniqueSlug('Test---', { checkExists });

      expect(slug).toBe('test');
    });

    it('should normalize slugs with suffix numbers', async () => {
      const checkExists = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const slug = await generateUniqueSlug('Test---Title', { checkExists });

      expect(slug).toBe('test-title-1');
    });
  });

  describe('max attempts', () => {
    it('should throw error when max attempts is reached', async () => {
      const checkExists = createMockCheckExists(true);

      await expect(
        generateUniqueSlug('Test', {
          checkExists,
          maxAttempts: 5
        })
      ).rejects.toThrow(utilsErrors.UNABLE_GENERATE_UNIQUE_SLUG);

      expect(checkExists).toHaveBeenCalledTimes(6);
    });

    it('should respect custom maxAttempts', async () => {
      const checkExists = createMockCheckExists(true);

      await expect(
        generateUniqueSlug('Test', {
          checkExists,
          maxAttempts: 3
        })
      ).rejects.toThrow(utilsErrors.UNABLE_GENERATE_UNIQUE_SLUG);

      expect(checkExists).toHaveBeenCalledTimes(4);
    });

    it('should find unique slug within max attempts', async () => {
      const checkExists = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const slug = await generateUniqueSlug('Test', {
        checkExists,
        maxAttempts: 10
      });

      expect(slug).toBe('test-3');
      expect(checkExists).toHaveBeenCalledTimes(4);
    });
  });
});
