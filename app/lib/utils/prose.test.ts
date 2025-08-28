import { proseToText, textToProse } from './prose';
import type { ProseDoc } from '~/types/store/pages/about-us';

describe('proseToText', () => {
  it('should return empty string for undefined doc', () => {
    expect(proseToText()).toBe('');
  });

  it('should return empty string for doc with empty content', () => {
    const doc: ProseDoc = { type: 'doc', content: [] };
    expect(proseToText(doc)).toBe('');
  });

  it('should convert simple paragraph to text', () => {
    const doc: ProseDoc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
    };
    expect(proseToText(doc)).toBe('Hello');
  });
});

describe('proseToText edge cases', () => {
  it('should return empty string for paragraph with no content', () => {
    const doc: ProseDoc = { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
    expect(proseToText(doc)).toBe('');
  });

  it('should handle paragraph content with multiple text nodes', () => {
    const doc: ProseDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello' },
            { type: 'text', text: ' ' },
            { type: 'text', text: 'World' }
          ]
        }
      ]
    };
    expect(proseToText(doc)).toBe('Hello World');
  });

  it('should ignore completely unknown nodes', () => {
    const doc: ProseDoc = {
      type: 'doc',
      content: [{ type: 'image', src: 'test.png' }]
    };
    expect(proseToText(doc)).toBe('');
  });
});

describe('textToProse', () => {
  it('should convert empty string to empty doc', () => {
    expect(textToProse('')).toEqual({ type: 'doc', content: [] });
  });

  it('should convert text to ProseDoc with one paragraph', () => {
    const text = 'Hello World';
    expect(textToProse(text)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] }]
    });
  });

  it('should convert multi-line text to single paragraph by default', () => {
    const text = 'Line1\nLine2';
    expect(textToProse(text)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
    });
  });
});
