import { renderHook } from '@testing-library/react';

import { PHONE_MASK, usePhoneInput } from './usePhoneInput';

const PHONE_FORMATTING_TEST_CASES = [
  { input: '0441234567', expected: '+38 044 123 4567' },
  { input: '+38 044 123 4567', expected: '+38 044 123 4567' }
];

describe('usePhoneInput', () => {
  it('formats a phone number to the backend format', () => {
    const { result } = renderHook(() => usePhoneInput());

    PHONE_FORMATTING_TEST_CASES.forEach(({ input, expected }) => {
      expect(result.current.formatPhoneNumber(input)).toBe(expected);
    });
  });

  it('returns an empty value when no phone digits remain', () => {
    const { result } = renderHook(() => usePhoneInput());

    expect(result.current.formatPhoneNumber('')).toBe('');
    expect(PHONE_MASK).toBe(PHONE_MASK);
  });
});
