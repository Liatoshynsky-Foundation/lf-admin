import type { JSONContent } from '@tiptap/react';

import { isPaymentDetailsTabValid } from './paymentDetailsContentValidation';

describe('isPaymentDetailsTabValid', () => {
  const createParagraph = (text?: string): JSONContent => ({
    type: 'paragraph',
    ...(text !== undefined && {
      content: [{ type: 'text', text }]
    })
  });

  const createDocument = (...paragraphs: JSONContent[]): JSONContent => ({
    type: 'doc',
    content: paragraphs
  });

  it('considers an untouched empty editor valid', () => {
    const content = createDocument(createParagraph());

    expect(isPaymentDetailsTabValid(content)).toBe(true);
  });

  it('considers a document without content valid', () => {
    expect(isPaymentDetailsTabValid({ type: 'doc' })).toBe(true);
  });

  it('considers meaningful text valid', () => {
    const content = createDocument(createParagraph('Payment details'));

    expect(isPaymentDetailsTabValid(content)).toBe(true);
  });

  it.each([
    ['spaces', '   '],
    ['line breaks', '\n\n'],
    ['tabs', '\t\t'],
    ['mixed whitespace', ' \n \t ']
  ])('considers text containing only %s invalid', (_, text) => {
    const content = createDocument(createParagraph(text));

    expect(isPaymentDetailsTabValid(content)).toBe(false);
  });

  it('considers multiple empty paragraphs invalid', () => {
    const content = createDocument(createParagraph(), createParagraph(), createParagraph());

    expect(isPaymentDetailsTabValid(content)).toBe(false);
  });

  it('considers a single empty paragraph with meaningful text in another paragraph valid', () => {
    const content = createDocument(createParagraph(), createParagraph('Payment details'));

    expect(isPaymentDetailsTabValid(content)).toBe(true);
  });

  it('considers hard breaks without meaningful text invalid', () => {
    const content = createDocument({
      type: 'paragraph',
      content: [{ type: 'hardBreak' }, { type: 'hardBreak' }]
    });

    expect(isPaymentDetailsTabValid(content)).toBe(false);
  });

  it('considers meaningful text alongside hard breaks valid', () => {
    const content = createDocument({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Payment details' }, { type: 'hardBreak' }, { type: 'hardBreak' }]
    });

    expect(isPaymentDetailsTabValid(content)).toBe(true);
  });

  it('considers whitespace-only content inside table cells invalid', () => {
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [createParagraph('   ')]
                }
              ]
            }
          ]
        }
      ]
    };

    expect(isPaymentDetailsTabValid(content)).toBe(false);
  });

  it('considers meaningful text inside table cells valid', () => {
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [createParagraph('Bank account')]
                }
              ]
            }
          ]
        }
      ]
    };

    expect(isPaymentDetailsTabValid(content)).toBe(true);
  });
  it('considers an untouched two-column requisites table valid', () => {
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [createParagraph()]
                },
                {
                  type: 'tableCell',
                  content: [createParagraph()]
                }
              ]
            }
          ]
        }
      ]
    };

    expect(isPaymentDetailsTabValid(content)).toBe(true);
  });

  it('considers multiple empty paragraphs inside a table cell invalid', () => {
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [createParagraph(), createParagraph()]
                },
                {
                  type: 'tableCell',
                  content: [createParagraph()]
                }
              ]
            }
          ]
        }
      ]
    };

    expect(isPaymentDetailsTabValid(content)).toBe(false);
  });
});
