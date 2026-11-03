import { zResearchWorkSchema, zResearchWorkStatusSchema, zResearchWorkUpdateSchema } from './researchWork.schema';
import { RESEARCH_VALIDATION_MESSAGES } from '~/constants/research';
import { BaseContentStatuses, TipTapNodeTypes } from '~/types/enums/common.enums';

describe('zResearchWorkSchema', () => {
  const validTipTapDoc = {
    type: TipTapNodeTypes.doc,
    content: [
      {
        type: TipTapNodeTypes.paragraph,
        content: [{ type: TipTapNodeTypes.text, text: 'Sample rich text' }]
      }
    ]
  };

  const validBaseWork = {
    bibliographicDescription: 'Valid description',
    author: 'Valid author',
    year: '1995',
    keywords: 'history, music',
    url: 'https://example.com/item',
    status: BaseContentStatuses.Published
  };

  describe('valid payloads', () => {
    it('accepts valid plain text strings for rich text fields', () => {
      const result = zResearchWorkSchema.safeParse(validBaseWork);

      expect(result.success).toBe(true);
    });

    it('accepts TipTap doc objects for bibliographicDescription, author, and keywords', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        bibliographicDescription: validTipTapDoc,
        author: validTipTapDoc,
        keywords: validTipTapDoc
      });

      expect(result.success).toBe(true);
    });

    it('accepts serialized TipTap JSON strings and validates their document structure', () => {
      const serializedDoc = JSON.stringify(validTipTapDoc);
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        bibliographicDescription: serializedDoc,
        author: serializedDoc,
        keywords: serializedDoc
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bibliographicDescription).toEqual(validTipTapDoc);
        expect(result.data.author).toEqual(validTipTapDoc);
        expect(result.data.keywords).toEqual(validTipTapDoc);
      }
    });

    it('accepts omitted or null keywords', () => {
      const withoutKeywords = { ...validBaseWork };
      Reflect.deleteProperty(withoutKeywords, 'keywords');

      const omittedResult = zResearchWorkSchema.safeParse(withoutKeywords);
      const nullResult = zResearchWorkSchema.safeParse({ ...validBaseWork, keywords: null });

      expect(omittedResult.success).toBe(true);
      if (omittedResult.success) {
        expect(omittedResult.data.keywords).toBeUndefined();
      }
      expect(nullResult.success).toBe(true);
      if (nullResult.success) {
        expect(nullResult.data.keywords).toBeNull();
      }
    });

    it('accepts very long formatted text payloads', () => {
      const longText = 'Formatted research text '.repeat(20_000);
      const longFormattedDoc = {
        type: TipTapNodeTypes.doc,
        content: [
          {
            type: TipTapNodeTypes.paragraph,
            content: [{ type: TipTapNodeTypes.text, text: longText, marks: [{ type: 'bold' }] }]
          },
          {
            type: TipTapNodeTypes.paragraph,
            content: [
              {
                type: TipTapNodeTypes.text,
                text: 'Read more',
                marks: [{ type: 'link', attrs: { href: 'https://example.com/research' } }]
              }
            ]
          }
        ]
      };

      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        bibliographicDescription: longFormattedDoc,
        author: validTipTapDoc
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bibliographicDescription).toEqual(longFormattedDoc);
      }
    });

    it('transforms empty string url and keywords to null', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        url: '',
        keywords: ''
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBeNull();
        expect(result.data.keywords).toBeNull();
      }
    });

    it('validates a valid pdfFile payload', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        pdfFile: {
          filename: 'document.pdf',
          url: 'https://storage.example.com/document.pdf',
          mimeType: 'application/pdf'
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid payloads', () => {
    it('returns error message when bibliographicDescription is empty string', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        bibliographicDescription: '   '
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldError = result.error.issues.find((i) => i.path.includes('bibliographicDescription'));
        expect(fieldError?.message).toBe(RESEARCH_VALIDATION_MESSAGES.bibliographicDescriptionRequired);
      }
    });

    it('returns error message when author is empty string', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        author: '   '
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldError = result.error.issues.find((i) => i.path.includes('author'));
        expect(fieldError?.message).toBe(RESEARCH_VALIDATION_MESSAGES.authorRequired);
      }
    });

    it.each([
      ['bibliographicDescription', ''],
      ['bibliographicDescription', { type: TipTapNodeTypes.doc, content: [] }],
      ['author', ''],
      ['author', { type: TipTapNodeTypes.text, text: 'Invalid author document' }]
    ] as const)('rejects empty or invalid %s values', (field, value) => {
      const result = zResearchWorkSchema.safeParse({ ...validBaseWork, [field]: value });

      expect(result.success).toBe(false);
    });

    it('returns error message when year exceeds 150 characters', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        year: '1'.repeat(151)
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldError = result.error.issues.find((i) => i.path.includes('year'));
        expect(fieldError?.message).toBe(RESEARCH_VALIDATION_MESSAGES.yearMaxLength);
      }
    });

    it('fails when keywords as plain string exceeds 250 characters', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        keywords: 'k'.repeat(251)
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldError = result.error.issues.find((i) => i.path.includes('keywords'));
        expect(fieldError?.message).toBe(RESEARCH_VALIDATION_MESSAGES.keywordsMaxLength);
      }
    });

    it('rejects non-pdf mimeType or non-pdf file extension', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        pdfFile: {
          filename: 'image.png',
          url: 'https://storage.example.com/image.png',
          mimeType: 'image/png'
        }
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const pdfError = result.error.issues.find((i) => i.path.includes('pdfFile'));
        expect(pdfError?.message).toBe(RESEARCH_VALIDATION_MESSAGES.pdfInvalidType);
      }
    });

    it('rejects malformed url string', () => {
      const result = zResearchWorkSchema.safeParse({
        ...validBaseWork,
        url: 'not-a-valid-url'
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const urlError = result.error.issues.find((i) => i.path.includes('url'));
        expect(urlError?.message).toBe(RESEARCH_VALIDATION_MESSAGES.urlInvalid);
      }
    });
  });
});

describe('zResearchWorkUpdateSchema', () => {
  it('allows partial payload without required fields', () => {
    const result = zResearchWorkUpdateSchema.safeParse({
      status: BaseContentStatuses.Hidden
    });

    expect(result.success).toBe(true);
  });
});

describe('zResearchWorkStatusSchema', () => {
  it('validates allowed visibility status values', () => {
    expect(zResearchWorkStatusSchema.safeParse({ status: BaseContentStatuses.Published }).success).toBe(true);
    expect(zResearchWorkStatusSchema.safeParse({ status: BaseContentStatuses.Hidden }).success).toBe(true);
    expect(zResearchWorkStatusSchema.safeParse({ status: 'ARCHIVED' }).success).toBe(false);
  });
});
