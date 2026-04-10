import { normalizeSearch } from './normalizeSearch';

describe('normalizeSearch', () => {
  it('trims whitespace from both sides', () => {
    expect(normalizeSearch('  hello world  ')).toBe('hello world');
  });

  it('converts input to lowercase', () => {
    expect(normalizeSearch('HeLLo')).toBe('hello');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeSearch('   ')).toBe('');
  });

  it('handles empty string', () => {
    expect(normalizeSearch('')).toBe('');
  });
});