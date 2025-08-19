import { fetchPreview } from './fetchPreview';

Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('fetchPreview', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, NEXT_PUBLIC_CLIENT_BASE_URL: 'http://localhost:3000' };
    window.location.href = '';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should construct the correct URL and assign it to window.location.href', () => {
    const previewProps = {
      slug: 'my-test-slug',
      lang: 'uk' as const,
      draftId: 123
    };
    const expectedUrl = 'http://localhost:3000/api/preview?lang=uk&slug=my-test-slug&draftId=123';
    fetchPreview(previewProps);
    expect(window.location.href).toBe(expectedUrl);
  });
});
