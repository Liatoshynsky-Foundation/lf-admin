import { Block } from '@blocknote/core';

import {
  cloneContent,
  deserializeContent,
  isContentEmpty,
  isContentEqual,
  serializeContent,
  validateContent
} from './contentSerializer';
import { CONTENT_VERSION } from './types';

describe('contentSerializer utilities', () => {
  const paragraphBlock = { id: '1', type: 'paragraph' } as unknown as Block;
  const nonParagraphBlock = { id: '2', type: 'image', props: { src: 'x' } } as unknown as Block;

  it('serializes content with version and lastModified', () => {
    const result = serializeContent([paragraphBlock]);

    expect(result).toMatchObject({
      blocks: [paragraphBlock],
      version: CONTENT_VERSION
    });
    expect(typeof result.lastModified).toBe('string');
    expect(new Date(result.lastModified).toString()).not.toBe('Invalid Date');
  });

  it('deserializes serialized content and returns raw blocks', () => {
    const serialized = {
      blocks: [paragraphBlock],
      version: CONTENT_VERSION,
      lastModified: new Date().toISOString()
    };

    expect(deserializeContent(serialized)).toEqual([paragraphBlock]);
  });

  it('deserializes arrays directly and returns null for invalid content', () => {
    expect(deserializeContent([paragraphBlock])).toEqual([paragraphBlock]);
    expect(deserializeContent(null)).toBeNull();
    expect(deserializeContent(undefined)).toBeNull();
    expect(deserializeContent({ foo: 'bar' } as unknown)).toBeNull();
  });

  it('validates content shape correctly', () => {
    expect(validateContent([paragraphBlock])).toBe(true);
    expect(validateContent([{ type: 'paragraph' } as unknown as Block])).toBe(false);
    expect(validateContent({} as unknown)).toBe(false);
    expect(validateContent(null as unknown)).toBe(false);
  });

  it('detects empty content conditions', () => {
    expect(isContentEmpty(null)).toBe(true);
    expect(isContentEmpty(undefined)).toBe(true);
    expect(isContentEmpty([])).toBe(true);
    expect(isContentEmpty([{ id: 'x', type: 'paragraph' } as unknown as Block])).toBe(true);
    expect(isContentEmpty([{ id: 'x', type: 'paragraph', content: [] } as unknown as Block])).toBe(true);
    expect(isContentEmpty([{ id: 'x', type: 'paragraph', content: ['text'] } as unknown as Block])).toBe(false);
    expect(isContentEmpty([nonParagraphBlock])).toBe(false);
  });

  it('compares content equality correctly', () => {
    const first = [paragraphBlock];
    const second = [paragraphBlock];
    const third = [{ id: '1', type: 'paragraph' } as unknown as Block];

    expect(isContentEqual(first, first)).toBe(true);
    expect(isContentEqual(first, second)).toBe(true);
    expect(isContentEqual(first, third)).toBe(true);
    expect(isContentEqual(first, [{ id: '2', type: 'paragraph' } as unknown as Block])).toBe(false);
    expect(
      isContentEqual(first, [
        { id: '1', type: 'paragraph' },
        { id: '2', type: 'paragraph' }
      ] as unknown as Block[])
    ).toBe(false);
    expect(isContentEqual(first, null)).toBe(false);
    expect(isContentEqual(null, null)).toBe(true);
  });

  it('clones content deeply', () => {
    const original = [{ id: '1', type: 'paragraph', props: { nested: true } } as unknown as Block];
    const cloned = cloneContent(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);

    (cloned[0] as unknown as { props: { nested: boolean } }).props.nested = false;
    expect((original[0] as unknown as { props: { nested: boolean } }).props.nested).toBe(true);
  });
});
