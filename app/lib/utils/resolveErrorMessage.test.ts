import { resolveErrorMessage } from './resolveErrorMessage';

describe('resolveErrorMessage', () => {
  it('returns the Error message when available', () => {
    expect(resolveErrorMessage(new Error('network failed'), 'fallback')).toBe('network failed');
  });

  it('returns the fallback for non-Error values', () => {
    expect(resolveErrorMessage('oops', 'fallback')).toBe('fallback');
    expect(resolveErrorMessage(null, 'fallback')).toBe('fallback');
  });
});
