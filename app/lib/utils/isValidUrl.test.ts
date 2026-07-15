import { isValidUrl } from './isValidUrl';

describe('isValidUrl', () => {
  it.each([
    ['http://example.com', true],
    ['https://example.com/path?query=1', true],
    ['invalid-url', false],
    ['/relative/path', false],
    ['', false],
  ])('should return %p when URL is %p', (url, expected) => {
    const result = isValidUrl(url);
    expect(result).toBe(expected);
  });
});