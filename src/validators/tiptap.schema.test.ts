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

  it('validates formatted text with bold, italic, and underline marks', () => {
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
        }
      ]
    };

    const result = TipTapDocSchema.safeParse(docWithMarks);

    expect(result.success).toBe(true);
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
});
