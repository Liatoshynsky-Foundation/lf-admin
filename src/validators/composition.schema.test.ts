import { compositionYearSchema } from './composition.schema';
import { COMPOSITION_VALIDATION_MESSAGES } from '~/constants/opus';

describe('compositionYearSchema', () => {
  it('allows empty or whitespace-only year (optional field)', () => {
    expect(compositionYearSchema.safeParse('').success).toBe(true);
    expect(compositionYearSchema.safeParse('   ').success).toBe(true);
  });

  it('allows valid boundary years (1900 and 3000)', () => {
    expect(compositionYearSchema.safeParse('1900').success).toBe(true);
    expect(compositionYearSchema.safeParse('3000').success).toBe(true);
  });

  it('allows a year inside the range', () => {
    expect(compositionYearSchema.safeParse('2024').success).toBe(true);
  });

  it('rejects years outside range (1899 and 3001)', () => {
    const minResult = compositionYearSchema.safeParse('1899');
    expect(minResult.success).toBe(false);
    if (!minResult.success) {
      expect(minResult.error.issues[0].message).toBe(COMPOSITION_VALIDATION_MESSAGES.yearOutOfRange);
    }

    const maxResult = compositionYearSchema.safeParse('3001');
    expect(maxResult.success).toBe(false);
    if (!maxResult.success) {
      expect(maxResult.error.issues[0].message).toBe(COMPOSITION_VALIDATION_MESSAGES.yearOutOfRange);
    }
  });

  it('rejects non-4-digit strings', () => {
    const shortResult = compositionYearSchema.safeParse('123');
    expect(shortResult.success).toBe(false);
    if (!shortResult.success) {
      expect(shortResult.error.issues[0].message).toBe(COMPOSITION_VALIDATION_MESSAGES.yearInvalid);
    }

    const textResult = compositionYearSchema.safeParse('abcd');
    expect(textResult.success).toBe(false);
    if (!textResult.success) {
      expect(textResult.error.issues[0].message).toBe(COMPOSITION_VALIDATION_MESSAGES.yearInvalid);
    }
  });
});
