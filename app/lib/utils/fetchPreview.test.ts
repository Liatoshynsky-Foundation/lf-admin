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
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should redirect to previewUrl when fetch succeeds', async () => {
    const mockResponse = { previewUrl: 'http://localhost:3000/uk/about?draftId=123' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    await fetchPreview({ slug: 'about', lang: 'uk', draftId: 123 });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/preview?lang=uk&slug=about&draftId=123', {
      method: 'GET',
      credentials: 'include'
    });

    expect(window.location.href).toBe(mockResponse.previewUrl);
  });

  it('should throw an error when fetch fails or response is invalid', async () => {
    const mockResponse = { message: 'Not found' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse
    });

    await expect(fetchPreview({ slug: 'about', lang: 'en', draftId: 456 })).rejects.toThrow('Failed to start preview');
    expect(window.location.href).toBe('');
  });
});
