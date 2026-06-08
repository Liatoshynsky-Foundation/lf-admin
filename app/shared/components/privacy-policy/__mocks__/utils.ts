
export const createParagraphNode = (text: string, id: string) => ({
  type: 'paragraph', content: [{ type: 'text', text }], id
});
