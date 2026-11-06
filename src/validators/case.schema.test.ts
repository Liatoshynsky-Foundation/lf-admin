import { zCaseSchema, zCaseUpdateSchema } from './case.schema';

describe('Case schemas detailedCaseDescription validation', () => {
  const baseValidCase = {
    fundId: 'valid-fund-id',
    descriptionNumber: 1,
    caseNumber: 1,
    caseName: { uk: 'Назва', en: 'Title' },
    caseDate: { uk: '2026', en: '2026' },
    sheetsNumber: 10,
    caseDescriptions: { uk: 'Опис справи', en: 'Description' }
  };

  const validTiptapDoc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Текст' }]
      }
    ]
  };

  describe.each([
    { schemaName: 'zCaseSchema', schema: zCaseSchema, data: baseValidCase },
    { schemaName: 'zCaseUpdateSchema', schema: zCaseUpdateSchema, data: {} }
  ])('validation in $schemaName', ({ schema, data }) => {
    it('should accept valid Tiptap JSON object', () => {
      const validData = {
        ...data,
        detailedCaseDescription: {
          uk: validTiptapDoc,
          en: validTiptapDoc
        }
      };

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept null values in detailedCaseDescription', () => {
      const validNullData = {
        ...data,
        detailedCaseDescription: {
          uk: null,
          en: null
        }
      };

      const result = schema.safeParse(validNullData);
      expect(result.success).toBe(true);
    });

    it('should reject  strings in detailedCaseDescription', () => {
      const invalidData = {
        ...data,
        detailedCaseDescription: {
          uk: 'This is just a string, not a Tiptap object',
          en: 'This should fail'
        }
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  it('should keep caseDescriptions restricted to original 300 characters (safety check)', () => {
    const invalidCaseDescriptions = {
      ...baseValidCase,
      caseDescriptions: {
        uk: 'a'.repeat(301),
        en: 'Description'
      }
    };

    const result = zCaseSchema.safeParse(invalidCaseDescriptions);
    expect(result.success).toBe(false);
  });
});
