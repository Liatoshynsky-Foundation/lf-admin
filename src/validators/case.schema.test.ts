import { zCaseSchema, zCaseUpdateSchema } from './case.schema';
import { CASE_VALIDATION_MESSAGES } from '~/constants/case';

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

  it('should accept detailedCaseDescription with exactly 5000 characters', () => {
    const validData = {
      ...baseValidCase,
      detailedCaseDescription: {
        uk: 'a'.repeat(5000),
        en: 'b'.repeat(5000)
      }
    };

    expect(zCaseSchema.safeParse(validData).success).toBe(true);
    expect(zCaseUpdateSchema.safeParse(validData).success).toBe(true);
  });

  describe.each([
    { schemaName: 'zCaseSchema', schema: zCaseSchema, data: baseValidCase },
    { schemaName: 'zCaseUpdateSchema', schema: zCaseUpdateSchema, data: {} }
  ])('rejections in $schemaName', ({ schema, data }) => {
    it.each(['uk', 'en'])('should reject when %s exceeds 5000 characters', (lang) => {
      const invalidData = {
        ...data,
        detailedCaseDescription: {
          uk: 'Valid text',
          en: 'Valid text',
          [lang]: 'a'.repeat(5001)
        }
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(CASE_VALIDATION_MESSAGES.detailedCaseDescriptionMaxLength);
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
