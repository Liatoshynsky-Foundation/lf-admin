import { isImageUploadFile } from './MediaModal.utils';

describe('isImageUploadFile', () => {
  describe('when file.type is set', () => {
    it('should return true for image/png', () => {
      const file = new File(['x'], 'photo.png', { type: 'image/png' });
      expect(isImageUploadFile(file)).toBe(true);
    });

    it('should return true for image/jpeg', () => {
      const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
      expect(isImageUploadFile(file)).toBe(true);
    });

    it('should return true for image/gif', () => {
      const file = new File(['x'], 'anim.gif', { type: 'image/gif' });
      expect(isImageUploadFile(file)).toBe(true);
    });

    it('should return false for application/pdf', () => {
      const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
      expect(isImageUploadFile(file)).toBe(false);
    });

    it('should return false for audio/mpeg', () => {
      const file = new File(['x'], 'song.mp3', { type: 'audio/mpeg' });
      expect(isImageUploadFile(file)).toBe(false);
    });
  });

  describe('when file.type is empty (fallback to filename)', () => {
    const noType = (name: string) => new File(['x'], name, { type: '' });

    it('should return true for .png extension', () => {
      expect(isImageUploadFile(noType('photo.png'))).toBe(true);
    });

    it('should return true for .jpg extension', () => {
      expect(isImageUploadFile(noType('photo.jpg'))).toBe(true);
    });

    it('should return true for .jpeg extension', () => {
      expect(isImageUploadFile(noType('photo.jpeg'))).toBe(true);
    });

    it('should return true for .gif extension', () => {
      expect(isImageUploadFile(noType('anim.gif'))).toBe(true);
    });

    it('should return true for .webp extension', () => {
      expect(isImageUploadFile(noType('photo.webp'))).toBe(true);
    });

    it('should return true for .svg extension', () => {
      expect(isImageUploadFile(noType('icon.svg'))).toBe(true);
    });

    it('should return true for uppercase extension (.PNG)', () => {
      expect(isImageUploadFile(noType('PHOTO.PNG'))).toBe(true);
    });

    it('should return false for .pdf extension', () => {
      expect(isImageUploadFile(noType('doc.pdf'))).toBe(false);
    });

    it('should return false for .mp3 extension', () => {
      expect(isImageUploadFile(noType('song.mp3'))).toBe(false);
    });

    it('should return false for unknown extension', () => {
      expect(isImageUploadFile(noType('data.csv'))).toBe(false);
    });
  });
});
