import { JSONContent } from '@tiptap/react';

import { isProseDoc, proseToHeaderText,proseToText, resolveLocalizedText, textToProse } from './prose';
import type { ProseDoc, ProseNode } from '~/types/common';

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
      content: [{ type: 'image', src: 'test.png' } as unknown as ProseNode]
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
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
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

describe('proseToHeaderText', () => {
  it('should return parsed text from prose doc when it exists', () => {
    const doc: ProseDoc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '  Header   Text  ' }] }]
    };
    expect(proseToHeaderText(doc, 'Fallback')).toBe('Header Text');
  });

  it('should return fallback string when prose doc is empty or evaluated to empty text', () => {
    expect(proseToHeaderText(undefined, 'Fallback Title')).toBe('Fallback Title');
  });

  it('should use default empty string fallback when second argument is omitted', () => {
    expect(proseToHeaderText(undefined)).toBe('');
  });
});

describe('isProseDoc', () => {
  it('should return true for a valid ProseDoc object', () => {
    const doc: ProseDoc = { type: 'doc', content: [] };
    expect(isProseDoc(doc)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isProseDoc(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isProseDoc(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isProseDoc('I am a string')).toBe(false);
  });

  it('should return false for an object without type="doc"', () => {
    const doc = { type: 'paragraph', content: [] };
    expect(isProseDoc(doc)).toBe(false);
  });
});

describe('resolveLocalizedText', () => {
  it('should return empty string for undefined', () => {
    expect(resolveLocalizedText(undefined)).toBe('');
  });

  it('should return empty string for null', () => {
    expect(resolveLocalizedText(null)).toBe('');
  });

  it('should return the string itself if passed a string', () => {
    expect(resolveLocalizedText('Direct string')).toBe('Direct string');
  });

  it('should extract text from a valid ProseDoc', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Extracted text' }] }]
    };
    expect(resolveLocalizedText(doc)).toBe('Extracted text');
  });

  it('should return empty string for non-string, non-ProseDoc objects', () => {
    const invalidObj: JSONContent = { type: 'unknown' };
    expect(resolveLocalizedText(invalidObj)).toBe('');
  });
});
