import {
  getCompositionNameRequiredMessage,
  getDuplicateCompositionError,
  getDuplicateCompositionIds,
  getDuplicateCompositionName,
  getErrorMessage,
  getInvalidCompositionIds,
  isCompositionNameRequiredError,
  normalizeCompositionName
} from './compositionErrors';

describe('composition error utilities', () => {
  it('normalizes names using trimming and Ukrainian case folding', () => {
    expect(normalizeCompositionName('  СОНАТА  ')).toBe('соната');
  });

  it('returns all ids sharing a non-empty normalized name', () => {
    expect(
      getDuplicateCompositionIds([
        { id: 'one', name: ' Соната ' },
        { id: 'two', name: 'соната' },
        { id: 'three', name: '  ' },
        { id: 'four', name: 'Концерт' }
      ])
    ).toEqual(['one', 'two']);
  });

  it('finds empty composition names', () => {
    expect(getInvalidCompositionIds([{ id: 'one', name: ' ' }, { id: 'two', name: 'Valid' }])).toEqual(['one']);
  });

  it('extracts error messages from Error, string, and unknown values', () => {
    expect(getErrorMessage(new Error('failed'))).toBe('failed');
    expect(getErrorMessage('failed')).toBe('failed');
    expect(getErrorMessage({ reason: 'failed' })).toBe('Unknown error');
  });

  it('parses duplicate and required-name errors', () => {
    const duplicate = new Error('Композиція "  Соната  " вже існує');

    expect(getDuplicateCompositionError(duplicate)).toEqual({
      name: 'соната',
      message: duplicate.message
    });
    expect(getDuplicateCompositionError(new Error('other'))).toBeNull();
    expect(isCompositionNameRequiredError(new Error('Composition name is required'))).toBe(true);
    expect(isCompositionNameRequiredError(new Error('other'))).toBe(false);
    expect(getDuplicateCompositionError('not an Error')).toBeNull();
    expect(getCompositionNameRequiredMessage()).toBeTruthy();
  });

  it('extracts duplicate names from errors and handles unsupported values', () => {
    expect(getDuplicateCompositionName(new Error('Композиція "  Соната  " вже існує'))).toBe('соната');
    expect(getDuplicateCompositionName(new Error('No quoted name'))).toBeNull();
    expect(getDuplicateCompositionName('not an Error')).toBeNull();
  });
});
