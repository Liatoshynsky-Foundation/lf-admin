import { compositionYearSchema } from './composition.schema';
import { COMPOSITION_VALIDATION_MESSAGES } from '~/constants/opus';

describe('compositionYearSchema', () => {
  it('allows empty or whitespace-only year (optional field)', () => {
    expect(compositionYearSchema.safeParse('').success).toBe(true);
    expect(compositionYearSchema.safeParse('   ').success).toBe(true);
  });

  it.each(['1900', '2024', '3000'])('allows valid year %s', (year) => {
    expect(compositionYearSchema.safeParse(year).success).toBe(true);
  });

  it.each(['1899', '3001'])('rejects year outside range %s', (year) => {
    const result = compositionYearSchema.safeParse(year);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(COMPOSITION_VALIDATION_MESSAGES.yearOutOfRange);
  });

  it.each(['123', 'abcd'])('rejects non-4-digit string %s', (year) => {
    const result = compositionYearSchema.safeParse(year);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(COMPOSITION_VALIDATION_MESSAGES.yearInvalid);
  });
});
