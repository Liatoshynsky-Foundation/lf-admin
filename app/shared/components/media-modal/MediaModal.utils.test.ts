import { isAnyAllowedFile, isImageUploadFile } from './MediaModal.utils';

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

describe('isAnyAllowedFile', () => {
  it('accepts a RAR archive when the extension is allowed', () => {
    expect(isAnyAllowedFile(createFile('archive.rar', 'application/x-rar-compressed'))).toBe(true);
  });

  it('rejects a non-RAR archive when the extension is not allowed', () => {
    expect(isAnyAllowedFile(createFile('archive.tar', 'application/octet-stream'))).toBe(false);
  });

  it('accepts files with a valid extension and a valid MIME type', () => {
    expect(isAnyAllowedFile(createFile('photo.png', 'image/png'))).toBe(true);
  });

  it('rejects files with a valid extension but an invalid MIME type', () => {
    expect(isAnyAllowedFile(createFile('photo.png', 'text/plain'))).toBe(false);
  });

  it('accepts files with an empty MIME type when the extension is allowed', () => {
    expect(isAnyAllowedFile(createFile('photo.png', ''))).toBe(true);
  });

  it('accepts files with octet-stream MIME type when the extension is allowed', () => {
    expect(isAnyAllowedFile(createFile('photo.png', 'application/octet-stream'))).toBe(true);
  });

  it('rejects files with an unsupported extension even if MIME type is valid', () => {
    expect(isAnyAllowedFile(createFile('document.exe', 'application/pdf'))).toBe(false);
  });

  it('rejects files with an unsupported extension and empty MIME type', () => {
    expect(isAnyAllowedFile(createFile('document.exe', ''))).toBe(false);
  });
});
