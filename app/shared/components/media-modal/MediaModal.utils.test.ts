import { isImageUploadFile } from './MediaModal.utils';

const createFile = (name: string, type: string) => new File(['x'], name, { type });

describe('isImageUploadFile', () => {
  describe('when file.type is set', () => {
    it.each<readonly [boolean, string, string]>([
      [true, 'image/png', 'photo.png'],
      [true, 'image/jpeg', 'photo.jpg'],
      [true, 'image/gif', 'anim.gif'],
      [false, 'application/pdf', 'doc.pdf'],
      [false, 'audio/mpeg', 'song.mp3']
    ])('should return %s for MIME %s (%s)', (expected, mimeType, name) => {
      expect(isImageUploadFile(createFile(name, mimeType))).toBe(expected);
    });
  });

  describe('when file.type is empty (fallback to filename)', () => {
    it.each<readonly [boolean, string]>([
      [true, 'photo.png'],
      [true, 'photo.jpg'],
      [true, 'photo.jpeg'],
      [true, 'anim.gif'],
      [true, 'photo.webp'],
      [true, 'icon.svg'],
      [true, 'PHOTO.PNG'],
      [false, 'doc.pdf'],
      [false, 'song.mp3'],
      [false, 'data.csv']
    ])('should return %s for extension %s', (expected, name) => {
      expect(isImageUploadFile(createFile(name, ''))).toBe(expected);
    });
  });
});
