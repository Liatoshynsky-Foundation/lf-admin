import { readFileAsDataURL } from './readFileAsDataURL';

describe('readFileAsDataURL', () => {
  it('should resolve with base64 string when file is successfully read', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    const result = await readFileAsDataURL(file);

    expect(result).toBe('data:image/png;base64,dGVzdA==');
  });
});
