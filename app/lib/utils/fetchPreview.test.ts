import { fetchPreview } from './fetchPreview';

interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

describe('fetchPreview', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    (globalThis.window as any).open = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch config and open the constructed preview URL in a new tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientAppUrl: 'http://localhost:3000' })
    });

    const props: PreviewProps = { slug: 'about', lang: 'uk', draftId: 123 };

    await fetchPreview(props);

    expect(globalThis.global.fetch).toHaveBeenCalledWith('/api/config');
    expect(globalThis.global.fetch).toHaveBeenCalledTimes(1);

    const expectedUrl = 'http://localhost:3000/api/preview?lang=uk&slug=about&draftId=123';
    expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
  });

  it('should throw an error if fetching the config fails', async () => {
    const fetchError = new Error('Failed to parse JSON');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw fetchError;
      }
    });

    const props: PreviewProps = { slug: 'about', lang: 'en', draftId: 456 };

    await expect(fetchPreview(props)).rejects.toThrow('Failed to parse JSON');
    expect(window.open).not.toHaveBeenCalled();
  });
});
