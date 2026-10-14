import { hasMemberImage } from './hasMemberImage';
import { DEFAULT_IMAGE_PLACEHOLDER } from '~/constants/files';

describe('hasMemberImage', () => {
  it.each([
    [undefined],
    [null],
    [{ src: '', generatedSrc: '' }],
    [{ src: '   ', generatedSrc: '  ' }],
    [{ src: DEFAULT_IMAGE_PLACEHOLDER, generatedSrc: '' }],
    [{ src: '', generatedSrc: DEFAULT_IMAGE_PLACEHOLDER }],
    [{ src: DEFAULT_IMAGE_PLACEHOLDER, generatedSrc: DEFAULT_IMAGE_PLACEHOLDER }]
  ])('returns false for %p', (photo) => {
    expect(hasMemberImage(photo)).toBe(false);
  });

  it.each([
    [{ src: 'https://example.com/a.png', generatedSrc: '' }],
    [{ src: '', generatedSrc: 'https://example.com/b.png' }]
  ])('returns true for %p', (photo) => {
    expect(hasMemberImage(photo)).toBe(true);
  });
});
