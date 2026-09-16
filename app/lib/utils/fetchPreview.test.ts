import { fetchPreview } from './fetchPreview';

describe('fetchPreview', () => {
  const originalFetch = global.fetch;
  const originalWindowOpen = window.open;
  let mockWindowOpen: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWindowOpen = jest.fn();
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.open = originalWindowOpen;
  });

  it('should fetch config and preview secret, then open preview window with query params', async () => {
    const mockConfigResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ clientAppUrl: 'https://client-app.com' })
    };

    const mockProxyResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ previewSecret: 'secret-123' })
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockConfigResponse)
      .mockResolvedValueOnce(mockProxyResponse);

    await fetchPreview({
      slug: 'news/test-slug',
      lang: 'uk',
      draftId: 'draft-999'
    });

    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/config');
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/preview-proxy', {
      method: 'GET',
      credentials: 'include'
    });

    const expectedUrl =
      'https://client-app.com/api/preview?lang=uk&slug=news%2Ftest-slug&draftId=draft-999&previewSecret=secret-123';

    expect(mockWindowOpen).toHaveBeenCalledWith(expectedUrl, '_blank');
  });

  it('should throw error when preview proxy response is not ok', async () => {
    const mockConfigResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ clientAppUrl: 'https://client-app.com' })
    };

    const mockProxyResponse = {
      ok: false
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockConfigResponse)
      .mockResolvedValueOnce(mockProxyResponse);

    await expect(
      fetchPreview({
        slug: 'events/test-event',
        lang: 'en',
        draftId: 123
      })
    ).rejects.toThrow('Failed to obtain preview credentials');

    expect(mockWindowOpen).not.toHaveBeenCalled();
  });
});
