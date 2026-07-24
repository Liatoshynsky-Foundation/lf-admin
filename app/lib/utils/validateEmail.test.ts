import { validateEmail } from './validateEmail';

describe('validateEmail', () => {
  it('returns error if email is empty', () => {
    expect(validateEmail('')).toBe('Введіть електронну пошту');
  });

  it('returns error if email is invalid', () => {
    expect(validateEmail('notanemail')).toBe('Введіть коректну електронну пошту');
  });

  it('returns null if email is valid', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('returns error if email exceeds 254 characters', () => {
    const longEmail = `${'a'.repeat(245)}@example.com`;
    expect(validateEmail(longEmail)).toBe('Електронна пошта занадто довга');
  });
});
