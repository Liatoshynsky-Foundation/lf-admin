import { parseAttributes, parseMetaTags, Parser } from './mediaMentionsParser';

describe('mediaMentions Parser', () => {
  it('should parse meta tags and json-ld into ParsedData', () => {
    const html = `
        <html><head>
            <meta property="og:title" content="OG Title" />
            <meta name="description" content="Desc here" />
            <meta property="og:image" content="https://example.com/img.jpg" />
            <meta property="og:image:width" content="320" />
            <meta property="og:image:height" content="180" />
            <meta property="og:site_name" content="SiteName" />
            <script type="application/ld+json">{
                "@type":"Article",
                "headline":"LD Headline",
                "author":{"name":"Alice"},
                "datePublished":"2020-01-02T03:04:05Z",
                "image":{"url":"https://example.com/ldimg.jpg","width":200,"height":100},
            }</script>
            <title>HTML Title</title>
        </head><body></body></html>
        `;

    const parsed = Parser(html);
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
      const attrs = parseAttributes(attrStr);
      expect(attrs['property']).toBe('og:title');
      expect(attrs['content']).toBe('Some Title');
      expect(attrs['data-info']).toBe('123');
      expect(attrs['emptyattr']).toBe('');
    });

    it('should parse escaped quotes inside quoted attribute values', () => {
      const s = 'data="escaped \\"quote\\" inside" other=' + '"it\\\'s"';
      const attrs = parseAttributes(s);
      expect(attrs['data']).toBe('escaped "quote" inside');
      expect(attrs['other']).toBe('it\'s');
    });

    it('should parse unquoted attribute values and case-insensitive names', () => {
      const s = 'DATA-VALUE=raw UPPER=1';
      const attrs = parseAttributes(s);
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
                </head><body></body></html>
            `;
      const tags = parseMetaTags(html);
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
      const parsed = Parser(html);
      expect(parsed.title).toBe('Meta Title');
    });

    it('should fall back to title/h1 or UNKNOWN when nothing present', () => {
      const htmlTitle = '<title>Only Title</title>';
      expect(Parser(htmlTitle).title).toBe('Only Title');

      const htmlEmpty = '<html></html>';
      expect(Parser(htmlEmpty).title).toBe('unknown');
    });
  });
});
