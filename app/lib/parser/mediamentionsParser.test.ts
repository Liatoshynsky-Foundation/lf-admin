import parseMediaMention, * as parserModule from './mediaMentionsParser';

describe('mediaMentions Parser', () => {
  it('should parse meta tags and json-ld into ParsedData', () => {
    const html = `
        <html><head>
            <meta property="og:title" content="OG Title" />
            <meta name="description" content="Desc here" />
            <meta property="og:image" content="https://example.com" />
            <meta property="og:image:width" content="320" />
            <meta property="og:image:height" content="180" />
            <meta property="og:site_name" content="SiteName" />
            <script type="application/ld+json">{
                "@type":"Article",
                "headline":"LD Headline",
                "author":{"name":"Alice"},
                "datePublished":"2020-01-02T03:04:05Z",
                "image":{"url":"https://example.com","width":200,"height":100}
            }</script>
            <title>HTML Title</title>
        </head><body></body></html>
        `;

    const parsed = parserModule.Parser(html);
    expect(parsed.title).toBe('OG Title');
    expect(parsed.description).toBe('Desc here');
    expect(parsed.site_name).toBe('SiteName');
    expect(parsed.author).toBe('Alice');
    expect(parsed.type).toBeDefined();
    expect(parsed.image).toBeTruthy();
    expect(parsed.image.src).toBeDefined();
    expect(parsed.published_time).toBeDefined();
  });

  describe('parseAttributes', () => {
    it('should parse attribute string into key-value map', () => {
      const attrStr = 'property="og:title" content="Some Title" data-info="123" emptyAttr';
      const attrs = parserModule.parseAttributes(attrStr);
      expect(attrs['property']).toBe('og:title');
      expect(attrs['content']).toBe('Some Title');
      expect(attrs['data-info']).toBe('123');
      expect(attrs['emptyattr']).toBe('');
    });

    it('should parse escaped quotes inside quoted attribute values', () => {
      const s = 'data="escaped \\"quote\\" inside" other=' + '"it\\\'s"';
      const attrs = parserModule.parseAttributes(s);
      expect(attrs['data']).toBe('escaped "quote" inside');
      expect(attrs['other']).toBe('it\'s');
    });

    it('should parse unquoted attribute values and case-insensitive names', () => {
      const s = 'DATA-VALUE=raw UPPER=1';
      const attrs = parserModule.parseAttributes(s);
      expect(attrs['data-value']).toBe('raw');
      expect(attrs['upper']).toBe('1');
    });
  });

  describe('parseMetaTags', () => {
    it('should extract meta tags from HTML', () => {
      const html = `
                <html><head>
                    <meta property="og:title" content="OG Title" /> 
                    <meta name="description" content="Description here" />
                    <meta property="" content="Missing Key" />
                    <meta name="empty-content" content="" />
                </head><body></body></html>
            `;
      const tags = parserModule.parseMetaTags(html);
      expect(tags).toEqual([
        { attrName: 'property', attrValue: 'og:title', content: 'OG Title' },
        { attrName: 'name', attrValue: 'description', content: 'Description here' }
      ]);
    });
  });

  describe('Parser fallbacks', () => {
    it('should prefer meta tags over json-ld when present', () => {
      const html = `
                <meta property="og:title" content="Meta Title" />
                <script type="application/ld+json">{"headline":"LD Title"}</script>
            `;
      const parsed = parserModule.Parser(html);
      expect(parsed.title).toBe('Meta Title');
    });

    it('should fall back to title/h1 or UNKNOWN when nothing present', () => {
      const htmlTitle = '<title>Only Title</title>';
      expect(parserModule.Parser(htmlTitle).title).toBe('Only Title');

      const htmlEmpty = '<html><meta name=" " content=" " /></html>';
      expect(parserModule.Parser(htmlEmpty).title).toBe('unknown');
    });

    it('should overwrite empty string in meta map with later valid content', () => {
      const html = `
        <meta property="og:title" content=" " />
        <meta property="og:title" content="Valid Title" />
      `;
      const parsed = parserModule.Parser(html);
      expect(parsed.title).toBe('Valid Title');
    });

    it('should not overwrite meta map if new content is empty', () => {
      const html = `
        <meta property="og:title" content="First Title" />
        <meta property="og:title" content=" " />
      `;
      const parsed = parserModule.Parser(html);
      expect(parsed.title).toBe('First Title');
    });
  });

  describe('parseMediaMention main function', () => {
    const globalFetch = globalThis.fetch;

    beforeEach(() => {
      globalThis.fetch = jest.fn();
      jest.useFakeTimers().setSystemTime(new Date('2026-07-24T12:00:00.000Z'));
    });

    afterEach(() => {
      globalThis.fetch = globalFetch;
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('should successfully fetch and parse media mention when response is ok', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('<html></html>')
      });

      const result = await parseMediaMention('https://test.com');

      expect(globalThis.fetch).toHaveBeenCalledWith('https://test.com', {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaMentionsParser/1.0)' }
      });

      expect(result).toEqual({
        url: 'https://test.com',
        adminTitle: 'unknown',
        title: { uk: 'unknown', en: 'unknown' },
        description: { uk: 'unknown', en: 'unknown' },
        keywords: { uk: '', en: '' },
        allowIndexation: { uk: true, en: true },
        coverImage: {
          src: 'unknown',
          alt: { uk: 'unknown', en: 'unknown' }
        },
        publishedAt: '2026-07-24T12:00:00.000Z',
        createdAt: '2026-07-24T12:00:00.000Z',
        updatedAt: '2026-07-24T12:00:00.000Z'
      });
    });

    it('should use dynamic values from parser when fields exist', async () => {
      const mockHtml = `
        <html><head>
          <meta property="og:title" content="Custom Title" />
          <meta property="og:description" content="Custom Desc" />
          <meta property="og:image" content="https://example.com" />
          <meta property="og:image:alt" content="Custom Alt" />
          <meta property="article:published_time" content="2026-05-10T10:00:00.000Z" />
        </head></html>
      `;

      (globalThis.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml)
      });

      const result = await parseMediaMention('https://test.com');
      expect(result.adminTitle).toBe('Custom Title');
      expect(result.publishedAt).toBe('2026-05-10T10:00:00.000Z');
      expect(result.coverImage.alt.uk).toBe('Custom Alt');
    });

    it('should fallback to parsed title when image alt is empty', async () => {
      const mockHtml = `
        <html>
          <head>
            <meta property="og:title" content="Title Dynamic Fallback" />
            <meta property="og:image" content="https://example.com" />
            <meta property="og:image:alt" content="" />
            <meta property="article:published_time" content="2026-05-10T10:00:00.000Z" />
          </head>
          <body>
            <h1>Title Dynamic Fallback</h1>
          </body>
        </html>
      `;

      (globalThis.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml)
      });

      const result = await parseMediaMention('https://test.com');
      expect(result.coverImage.alt.uk).toBe('Title Dynamic Fallback');
    });

    it('should throw an error when fetch response is not ok', async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(parseMediaMention('https://test.com')).rejects.toThrow('Failed to fetch URL: 404 Not Found');
    });
  });
});
