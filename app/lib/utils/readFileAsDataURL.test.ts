import { readFileAsDataURL } from './readFileAsDataURL';

describe('readFileAsDataURL', () => {
  const originalFileReader = global.FileReader;

  afterEach(() => {
    global.FileReader = originalFileReader;
  });

  it('should resolve with base64 string when file is successfully read', async () => {
    const mockResult = 'data:image/png;base64,dGVzdA==';

    class MockFileReader {
      public result: string | null = null;
      public onloadend: (() => void) | null = null;
      public onerror: (() => void) | null = null;
      readAsDataURL = jest.fn(() => {
        this.result = mockResult;
        this.onloadend?.();
      });
    }

    global.FileReader = MockFileReader as any;

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const result = await readFileAsDataURL(file);

    expect(result).toBe(mockResult);
  });
});
