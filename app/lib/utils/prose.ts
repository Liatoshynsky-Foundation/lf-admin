import type { ProseDoc, ProseNode, ProseTextNode } from '~/types/store/pages/about-us';

export const proseToText = (doc?: ProseDoc): string => {
  if (!doc?.content) return '';

  return doc.content
    .map((node: ProseNode) => {
      if (node.type === 'paragraph') {
        const paragraph = node as { type: 'paragraph'; content: ProseTextNode[] };
        return paragraph.content?.map((child) => child.text).join('') || '';
      }
      return '';
    })
    .join('\n');
};

export const textToProse = (text: string): ProseDoc => ({
  type: 'doc',
  content: text ? [{ type: 'paragraph', content: [{ type: 'text', text }] }] : []
});
