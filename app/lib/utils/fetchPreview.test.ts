import { fetchPreview } from './fetchPreview';

describe('fetchPreview', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.NEXT_PUBLIC_CLIENT_BASE_URL = 'http://localhost:3000';
    global.fetch = jest.fn();
    (window as unknown as { open: unknown }).open = jest.fn();
  });

  afterEach(() => {
    process.env = OLD_ENV;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should open previewUrl in a new tab and resolve on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ previewUrl: 'http://localhost:3000/uk/about?draftId=123' })
    });

    await expect(fetchPreview({ slug: 'about', lang: 'uk', draftId: 123 })).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/preview?lang=uk&slug=about&draftId=123', {
      method: 'GET',
      credentials: 'include'
    });
    expect(window.open).toHaveBeenCalledWith('http://localhost:3000/uk/about?draftId=123', '_blank');
  });

  it('should throw when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Not found' })
    });

    await expect(fetchPreview({ slug: 'about', lang: 'en', draftId: 456 })).rejects.toThrow('Failed to start preview');

    expect(window.open).not.toHaveBeenCalled();
  });

  it('should throw when previewUrl is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    await expect(fetchPreview({ slug: 'about', lang: 'uk', draftId: 789 })).rejects.toThrow('Failed to start preview');

    expect(window.open).not.toHaveBeenCalled();
  });
});
