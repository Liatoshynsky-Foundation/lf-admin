export const testEditorData = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Test Event Title' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ' },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'rich text'
        },
        { type: 'text', text: ' test content with ' },
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'multiple'
        },
        { type: 'text', text: ' formatting options.' }
      ]
    },
    {
      type: 'image',
      attrs: {
        src: 'https://via.placeholder.com/600x300',
        alt: 'Test image',
        title: null
      }
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Here is a bulleted list:' }]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First item' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second item' }] }]
        }
      ]
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'And here is a numbered list:' }]
    },
    {
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }]
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This should be enough to test paragraphs, lists, images, headings, and formatting.' }
      ]
    }
  ]
};
