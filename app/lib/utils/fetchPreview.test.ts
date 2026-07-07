import { fetchPreview } from './fetchPreview';

interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

describe('fetchPreview', () => {
  const mockFetch = jest.fn();
  const mockWindowOpen = jest.fn();
  const props: PreviewProps = { slug: 'about', lang: 'uk', draftId: 123 };
  const configResponse = { clientAppUrl: 'http://localhost:3000' };
  const proxyResponse = { previewSecret: 'test-preview-secret' };
  const expectedUrl =
    'http://localhost:3000/api/preview?lang=uk&slug=about&draftId=123&previewSecret=test-preview-secret';

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch config and proxy, then open preview URL with secret', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => configResponse
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => proxyResponse
    });

    await fetchPreview(props);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith('/api/config');
    expect(mockFetch).toHaveBeenCalledWith('/api/preview-proxy', {
      method: 'GET',
      credentials: 'include'
    });
    expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
  });

  it('should throw and not open a window if proxy request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => configResponse
    });
    mockFetch.mockResolvedValueOnce({
      ok: false
    });

    await expect(fetchPreview(props)).rejects.toThrow('Failed to obtain preview credentials');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should throw an error and not open a window if fetching the config fails', async () => {
    const configError = new Error('API is down');
    mockFetch.mockRejectedValueOnce(configError);

    await expect(fetchPreview(props)).rejects.toThrow('API is down');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/config');
    expect(window.open).not.toHaveBeenCalled();
  });
});
