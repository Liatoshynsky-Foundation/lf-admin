import { TipTapDocSchema } from './tiptap.schema';
import { TipTapMarkType, TipTapNodeTypes, TipTapTableNodeTypes } from '~/types/enums/common.enums';

describe('TipTapDocSchema', () => {
  const validParagraphNode = {
    type: TipTapNodeTypes.paragraph,
    content: [
      {
        type: TipTapNodeTypes.text,
        text: 'Hello world'
      }
    ]
  };

  it('validates a document with standard text paragraph', () => {
    const validDoc = {
      type: TipTapNodeTypes.doc,
      content: [validParagraphNode]
    };

    const result = TipTapDocSchema.safeParse(validDoc);

    expect(result.success).toBe(true);
  });

  it('validates a minimal valid document', () => {
    const result = TipTapDocSchema.safeParse({
      type: TipTapNodeTypes.doc,
      content: [{ type: TipTapNodeTypes.paragraph, content: [{ type: TipTapNodeTypes.text, text: 'Hello' }] }]
    });

    expect(result.success).toBe(true);
  });

  it('validates multiple paragraphs with bold, italic, underline, and valid links', () => {
    const docWithMarks = {
      type: TipTapNodeTypes.doc,
      content: [
        {
          type: TipTapNodeTypes.paragraph,
          content: [
            {
              type: TipTapNodeTypes.text,
              text: 'Bold text',
              marks: [{ type: TipTapMarkType.bold }]
            },
            {
              type: TipTapNodeTypes.text,
              text: 'Italic text',
              marks: [{ type: TipTapMarkType.italic }]
            },
            {
              type: TipTapNodeTypes.text,
              text: 'Underline text',
              marks: [{ type: TipTapMarkType.underline }]
            }
          ]
        },
        {
          type: TipTapNodeTypes.paragraph,
          content: [
            {
              type: TipTapNodeTypes.text,
              text: 'Linked text',
              marks: [{ type: TipTapMarkType.link, attrs: { href: 'https://example.com/research' } }]
            }
          ]
        }
      ]
    };

    const result = TipTapDocSchema.safeParse(docWithMarks);

    expect(result.success).toBe(true);
  });

  it('validates a serialized JSON document and returns its parsed shape', () => {
    const serializedDoc = JSON.stringify({
      type: TipTapNodeTypes.doc,
      content: [validParagraphNode]
    });

    const result = TipTapDocSchema.safeParse(serializedDoc);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(JSON.parse(serializedDoc));
    }
  });

  it('validates a document with a table structure', () => {
    const docWithTable = {
      type: TipTapNodeTypes.doc,
      content: [
        {
          type: TipTapTableNodeTypes.table,
          content: [
            {
              type: TipTapTableNodeTypes.tableRow,
              content: [
                {
                  type: TipTapTableNodeTypes.tableHeader,
                  content: [validParagraphNode]
                },
                {
                  type: TipTapTableNodeTypes.tableCell,
                  content: [validParagraphNode]
                }
              ]
            }
          ]
        }
      ]
    };

    const result = TipTapDocSchema.safeParse(docWithTable);

    expect(result.success).toBe(true);
  });

  it('does not restrict the number of cells in a table row', () => {
    const cell = (text: string) => ({
      type: TipTapTableNodeTypes.tableCell,
      content: [{ type: TipTapNodeTypes.paragraph, content: [{ type: TipTapNodeTypes.text, text }] }]
    });

    const result = TipTapDocSchema.safeParse({
      type: TipTapNodeTypes.doc,
      content: [
        {
          type: TipTapTableNodeTypes.table,
          content: [{ type: TipTapTableNodeTypes.tableRow, content: [cell('First'), cell('Second'), cell('Third')] }]
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it('fails validation when content array is empty', () => {
    const emptyDoc = {
      type: TipTapNodeTypes.doc,
      content: []
    };

    const result = TipTapDocSchema.safeParse(emptyDoc);

    expect(result.success).toBe(false);
  });

  it('fails validation when doc type is incorrect', () => {
    const invalidDoc = {
      type: 'invalidDocType',
      content: [validParagraphNode]
    };

    const result = TipTapDocSchema.safeParse(invalidDoc);

    expect(result.success).toBe(false);
  });

  it.each([
    ['missing the root doc type', { content: [validParagraphNode] }],
    ['using a text root type', { type: TipTapNodeTypes.text, content: [validParagraphNode] }]
  ])('fails validation for a document %s', (_description, invalidDoc) => {
    expect(TipTapDocSchema.safeParse(invalidDoc).success).toBe(false);
  });

  it.each([
    ['null', null],
    ['a string', 'content'],
    ['a number', 1],
    ['an object', { paragraph: validParagraphNode }]
  ])('fails validation when document content is %s', (_description, content: unknown) => {
    expect(TipTapDocSchema.safeParse({ type: TipTapNodeTypes.doc, content }).success).toBe(false);
  });

  it.each([
    ['missing its node type', { content: [{ type: TipTapNodeTypes.text, text: 'Hello' }] }],
    ['containing an invalid child', {
      type: TipTapNodeTypes.paragraph,
      content: [{ type: 'image', src: 'image.png' }]
    }],
    ['using non-array children', { type: TipTapNodeTypes.paragraph, content: 'Hello' }]
  ])('fails validation for a paragraph %s', (_description, paragraph) => {
    expect(
      TipTapDocSchema.safeParse({ type: TipTapNodeTypes.doc, content: [paragraph] }).success
    ).toBe(false);
  });

  it('fails validation when a text node omits its text property', () => {
    const result = TipTapDocSchema.safeParse({
      type: TipTapNodeTypes.doc,
      content: [{ type: TipTapNodeTypes.paragraph, content: [{ type: TipTapNodeTypes.text }] }]
    });

    expect(result.success).toBe(false);
  });

  it('fails validation for unsupported mark types', () => {
    const invalidMarkDoc = {
      type: TipTapNodeTypes.doc,
      content: [
        {
          type: TipTapNodeTypes.paragraph,
          content: [
            {
              type: TipTapNodeTypes.text,
              text: 'Sample',
              marks: [{ type: 'strike' }]
            }
          ]
        }
      ]
    };

    const result = TipTapDocSchema.safeParse(invalidMarkDoc);

    expect(result.success).toBe(false);
  });

  it('fails validation for a link mark with an invalid URL', () => {
    const invalidLinkDoc = {
      type: TipTapNodeTypes.doc,
      content: [
        {
          type: TipTapNodeTypes.paragraph,
          content: [
            {
              type: TipTapNodeTypes.text,
              text: 'Linked text',
              marks: [{ type: TipTapMarkType.link, attrs: { href: 'not-a-url' } }]
            }
          ]
        }
      ]
    };

    expect(TipTapDocSchema.safeParse(invalidLinkDoc).success).toBe(false);
  });

  it.each(['{ invalid json', '{"type":"doc","content":', 'not json'])(
    'fails validation for malformed serialized content: %s',
    (serializedDoc) => {
      expect(TipTapDocSchema.safeParse(serializedDoc).success).toBe(false);
    }
  );
});
