import { displayNameFromFile, fileNameFromUrl } from './assetFilename';

const files = {
  pdf: {
    url: 'https://cdn.example.com/media/My%20Score.pdf',
    name: '  Custom title  ',
    fileName: 'My Score.pdf'
  },
  audio: {
    url: '/media/audio.mp3?token=1',
    fileName: 'audio.mp3'
  },
  invalidEncoding: {
    url: '/media/%E0%A4%A.mp3',
    fileName: '%E0%A4%A.mp3'
  },
  pathWithoutFilename: {
    url: '/',
    fileName: '/'
  }
};

describe('asset filename utilities', () => {
  describe('fileNameFromUrl', () => {
    it('extracts and decodes a filename from absolute and relative URLs', () => {
      expect(fileNameFromUrl(files.pdf.url + '?token=1')).toBe(files.pdf.fileName);
      expect(fileNameFromUrl(files.audio.url)).toBe(files.audio.fileName);
      expect(fileNameFromUrl(files.pdf.url)).toBe(files.pdf.fileName);
    });

    it('handles missing URLs and invalid percent encoding', () => {
      expect(fileNameFromUrl()).toBe('');
      expect(fileNameFromUrl(files.invalidEncoding.url)).toBe(files.invalidEncoding.fileName);
      expect(fileNameFromUrl(files.pathWithoutFilename.url)).toBe(files.pathWithoutFilename.fileName);
    });
  });
  
  describe('displayNameFromFile', () => {
    it('prefers a trimmed non-empty explicit filename for display', () => {
      expect(displayNameFromFile(files.pdf.name, files.pdf.url)).toBe(files.pdf.name.trim());
      expect(displayNameFromFile(' ', files.audio.url)).toBe(files.audio.fileName);
    });
  });
});
