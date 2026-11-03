import { JSONContent } from '@tiptap/react';

import { isProseDoc, proseToHeaderText, proseToText, resolveLocalizedText, textToProse } from './prose';
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

  it('should extract text from a serialized TipTap document', () => {
    const doc: ProseDoc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Serialized text' }] }]
    };
    expect(proseToText(JSON.stringify(doc))).toBe('Serialized text');
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

describe('TipTap edge cases and fallback safety', () => {
  it('should correctly join text from multiple paragraphs with spaces', () => {
    const multiParagraphDoc = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Перший абзац.' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Другий абзац.' }] }
      ]
    });

    expect(proseToText(multiParagraphDoc)).toBe('Перший абзац. Другий абзац.');
  });

  it('should extract plain text from nodes with marks (bold, italic, links)', () => {
    const formattedDoc = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Звичайний ' },
            { type: 'text', text: 'жирний', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' та ' },
            { type: 'text', text: 'курсив', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' і ' },
            { type: 'text', text: 'посилання', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] }
          ]
        }
      ]
    });

    expect(proseToText(formattedDoc)).toBe('Звичайний жирний та курсив і посилання');
  });

  it('should gracefully return original string if json is malformed', () => {
    const malformedJson = '{ "type": "doc", "content": "<invalid>" ';
    expect(proseToText(malformedJson)).toBe(malformedJson);
  });

  it('should safely handle empty doc without content nodes', () => {
    const emptyDoc = JSON.stringify({
      type: 'doc',
      content: []
    });
    expect(proseToText(emptyDoc)).toBe('');
    expect(proseToText(JSON.stringify({ type: 'doc' }))).toBe('');
  });

  it('should preserve backward compatibility for legacy non-json strings', () => {
    const legacyPlainText = 'Лятошинський Борис Миколайович';
    expect(proseToText(legacyPlainText)).toBe(legacyPlainText);
  });

  it('should return empty string for null, undefined, empty, or whitespace-only input', () => {
    expect(proseToText(null)).toBe('');
    expect(proseToText(undefined)).toBe('');
    expect(proseToText('')).toBe('');
    expect(proseToText('   ')).toBe('');
  });
});
