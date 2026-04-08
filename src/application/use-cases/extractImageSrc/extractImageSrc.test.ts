import { extractImageSrcs, extractImagesWithMetadata } from './extractImageSrc';
import { JsonValue } from '~/back-shared/types/pages/types';

const compareFn = (a: string, b: string) => a.localeCompare(b);

describe('extractImageSrcs with Metadata', () => {
  it('should find src if crop is present even if isTmp is missing', () => {
    const data: JsonValue = {
      image: { src: 'cropped-image.jpg', crop: { x: 0, y: 0, width: 100, height: 100 } }
    };
    expect(extractImageSrcs(data)).toEqual(['cropped-image.jpg']);
  });

  it('should extract full metadata including crop object', () => {
    const crop = { x: 10, y: 20, width: 200, height: 150 };
    const data: JsonValue = {
      image: { src: 'test.png', crop }
    };
    const result = extractImagesWithMetadata(data);
    expect(result).toEqual([{ src: 'test.png', crop }]);
  });

  it('should find both isTmp and cropped images', () => {
    const data: JsonValue = {
      img1: { src: 'tmp.jpg', isTmp: true },
      img2: { src: 'permanent-cropped.jpg', isTmp: false, crop: { x: 1, y: 1, width: 5, height: 5 } }
    };
    const expected = ['tmp.jpg', 'permanent-cropped.jpg'];
    expect(extractImageSrcs(data).toSorted(compareFn)).toEqual(expected.toSorted(compareFn));
  });

  it('should handle deeply nested crops in arrays', () => {
    const data: JsonValue = {
      blocks: [
        {
          items: [
            { photo: { src: 'nested.jpg', crop: { x: 1, y: 1, width: 1, height: 1 } } }
          ]
        }
      ]
    };
    const result = extractImagesWithMetadata(data);
    expect(result).toHaveLength(1);
    expect(result[0].src).toBe('nested.jpg');
    expect(result[0].crop).toBeDefined();
  });
});

describe('extractImageSrcs uniqueness', () => {
  it('should return unique sources even if duplicates exist', () => {
    const data: JsonValue = {
      image1: { src: 'duplicate.jpg', isTmp: true },
      image2: { src: 'unique.png', isTmp: true },
      image3: { src: 'duplicate.jpg', crop: { x: 0, y: 0, width: 10, height: 10 } }
    };
    const expected = ['duplicate.jpg', 'unique.png'];
    const sortedResult = extractImageSrcs(data).toSorted(compareFn);
    const sortedExpected = expected.toSorted(compareFn);

    expect(sortedResult).toEqual(sortedExpected);
  });

  it('should return unique metadata objects but unique srcs in extractImageSrcs', () => {
    const data: JsonValue = {
      section1: { src: 'image.jpg', isTmp: true },
      section2: { src: 'image.jpg', crop: { x: 0, y: 0, width: 1, height: 1 } }
    };

    const metadata = extractImagesWithMetadata(data);
    const srcs = extractImageSrcs(data);

    expect(metadata).toHaveLength(2);
    expect(srcs).toHaveLength(1);
    expect(srcs).toEqual(['image.jpg']);
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
    const sortedResult = extractImageSrcs(data).toSorted(compareFn);
    const sortedExpected = expected.toSorted(compareFn);

    expect(sortedResult).toEqual(sortedExpected);
  });

  it('should NOT extract src if isTmp is false and no crop is present', () => {
    const data: JsonValue = {
      image: { src: 'permanent-image.jpg', isTmp: false }
    };
    expect(extractImageSrcs(data)).toEqual([]);
  });
});

describe('extractImageSrcs', () => {
  it('should find a single src at the top level of an object', () => {
    const data: JsonValue = {
      image: { src: 'temp-image.jpg', isTmp: true },
      title: 'Test'
    };
    expect(extractImageSrcs(data)).toEqual(['temp-image.jpg']);
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
    const sortedResult = extractImageSrcs(data).toSorted(compareFn);
    const sortedExpected = expected.toSorted(compareFn);

    expect(sortedResult).toEqual(sortedExpected);
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
