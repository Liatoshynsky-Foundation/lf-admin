import { fetchPreview } from './fetchPreview';

interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

describe('fetchPreview', () => {
  const mockFetch = jest.fn();
  const mockWindowOpen = jest.fn();
  const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const props: PreviewProps = { slug: 'about', lang: 'uk', draftId: 123 };
  const configResponse = { clientAppUrl: 'http://localhost:3000' };
  const expectedUrl = 'http://localhost:3000/api/preview?lang=uk&slug=about&draftId=123';

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call fetch twice and open a new window when all requests are successful', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => configResponse
    });
    mockFetch.mockResolvedValueOnce({
      ok: true
    });

    await fetchPreview(props);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith('/api/config');
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'GET',
      credentials: 'include'
    });
    expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
    expect(mockConsoleWarn).not.toHaveBeenCalled();
  });

  it('should still open a new window even if the second fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => configResponse
    });
    const corsError = new Error('Failed to fetch');
    mockFetch.mockRejectedValueOnce(corsError);

    await fetchPreview(props);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockConsoleWarn).toHaveBeenCalledWith('Temporary preview fetch failed');
    expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
  });

  it('should throw an error and not open a window if fetching the config fails', async () => {
    const configError = new Error('API is down');
    mockFetch.mockRejectedValueOnce(configError);
    await expect(fetchPreview(props)).rejects.toThrow('API is down');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/config');
    expect(window.open).not.toHaveBeenCalled();
    expect(mockConsoleWarn).not.toHaveBeenCalled();
  });
});
