import { getLocalizations } from './localizations';

describe('getLocalizations', () => {
  it('should return empty string when both uk and en are present', () => {
    const result = getLocalizations(['uk', 'en']);

    expect(result).toBe('');
  });

  it('should return EN when only en is present', () => {
    const result = getLocalizations(['en']);

    expect(result).toBe('EN');
  });

  it('should return UK when only uk is present', () => {
    const result = getLocalizations(['uk']);

    expect(result).toBe('UK');
  });

  it('should return UK when locale array is empty', () => {
    const result = getLocalizations([]);

    expect(result).toBe('UK');
  });

  it('should return UK when neither uk nor en are present', () => {
    const result = getLocalizations(['fr', 'de']);

    expect(result).toBe('UK');
  });
});
