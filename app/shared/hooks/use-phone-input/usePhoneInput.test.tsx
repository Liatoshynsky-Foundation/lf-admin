import { createEvent, fireEvent, render, renderHook, screen } from '@testing-library/react';

import { PHONE_MASK, usePhoneInput } from './usePhoneInput';

const PhoneInput = () => {
  const { handlePhoneKeyDown } = usePhoneInput();

  return <input aria-label="phone" onKeyDown={handlePhoneKeyDown} />;
};

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

  it('blocks non-numeric keys and allows digits', () => {
    render(<PhoneInput />);
    const input = screen.getByRole('textbox', { name: 'phone' });

    const letterEvent = createEvent.keyDown(input, { key: 'a' });
    fireEvent(input, letterEvent);
    expect(letterEvent.defaultPrevented).toBe(true);

    const digitEvent = createEvent.keyDown(input, { key: '1' });
    fireEvent(input, digitEvent);
    expect(digitEvent.defaultPrevented).toBe(false);
  });
});
