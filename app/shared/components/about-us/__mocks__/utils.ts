import { JSONContent} from '@tiptap/react';

export const createDocNode = (text: string): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
});
