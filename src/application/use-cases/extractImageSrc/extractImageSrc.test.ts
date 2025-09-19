import { extractImageSrcs } from './extractImageSrc';
import { JsonValue } from '~/back-shared/types/pages/types';

const compareFn = (a: string, b: string) => a.localeCompare(b);

describe('extractImageSrcs', () => {
  it('should find a single src at the top level of an object', () => {
    const data: JsonValue = {
      image: { src: 'temp-image.jpg', isTmp: true },
      title: 'Test'
    };
    expect(extractImageSrcs(data)).toEqual(['temp-image.jpg']);
  });

  it('should find a deeply nested src', () => {
    const data: JsonValue = {
      level1: {
        level2: {
          image: { src: 'nested-image.png', isTmp: true }
        }
      }
    };
    expect(extractImageSrcs(data)).toEqual(['nested-image.png']);
  });

  it('should find sources inside an array of objects', () => {
    const data: JsonValue = [
      { id: 1, image: { src: 'array-image-1.gif', isTmp: true } },
      { id: 2, text: 'No image here' },
      { id: 3, image: { src: 'array-image-2.webp', isTmp: true } }
    ];
    const expected = ['array-image-1.gif', 'array-image-2.webp'];
    expect(extractImageSrcs(data).sort(compareFn)).toEqual(expected.sort(compareFn));
  });

  it('should NOT extract src if isTmp is false', () => {
    const data: JsonValue = {
      image: { src: 'permanent-image.jpg', isTmp: false }
    };
    expect(extractImageSrcs(data)).toEqual([]);
  });

  it('should find all valid sources in a complex nested structure', () => {
    const data: JsonValue = {
      header: {
        logo: { src: 'logo.svg', isTmp: true }
      },
      content: [
        {
          type: 'text',
          value: 'Hello'
        },
        {
          type: 'image',
          data: { src: 'content-img.png', isTmp: true }
        },
        {
          type: 'gallery',
          images: [
            { src: 'gallery-1.jpg', isTmp: false },
            { src: 'gallery-2.jpg', isTmp: true }
          ]
        }
      ],
      footer: {
        image: { src: 'ignored.gif' }
      }
    };
    const expected = ['logo.svg', 'content-img.png', 'gallery-2.jpg'];
    expect(extractImageSrcs(data).sort(compareFn)).toEqual(expected.sort(compareFn));
  });

  it('should return unique sources even if duplicates exist', () => {
    const data: JsonValue = {
      image1: { src: 'duplicate.jpg', isTmp: true },
      image2: { src: 'unique.png', isTmp: true },
      image3: { src: 'duplicate.jpg', isTmp: true }
    };
    const expected = ['duplicate.jpg', 'unique.png'];
    expect(extractImageSrcs(data).sort(compareFn)).toEqual(expected.sort(compareFn));
  });

  describe('Edge cases', () => {
    it('should return an empty array for an empty object', () => {
      const data: JsonValue = {};
      expect(extractImageSrcs(data)).toEqual([]);
    });

    it('should return an empty array for an empty array', () => {
      const data: JsonValue = [];
      expect(extractImageSrcs(data)).toEqual([]);
    });

    it('should return an empty array for null or undefined input', () => {
      expect(extractImageSrcs(null)).toEqual([]);
      expect(extractImageSrcs(undefined as unknown as JsonValue)).toEqual([]);
    });

    it('should return an empty array for a primitive value input', () => {
      expect(extractImageSrcs('a string')).toEqual([]);
      expect(extractImageSrcs(123)).toEqual([]);
    });
  });
});
