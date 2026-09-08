import { JSONContent } from '@tiptap/react';

import { HeadingNode, ParagraphNode, ProseDoc, ProseNode, ProseTextNode } from '~/types/common';

export const proseToText = (doc?: unknown): string => {
  if (!doc) return '';
  if (typeof doc === 'string') {
    return doc.replace(/<[^>]*>?/gm, '');
  }

  const typedDoc = doc as Partial<ProseDoc>;
  if (!typedDoc.content || !Array.isArray(typedDoc.content)) return '';

  return typedDoc.content
    .map((node: ProseNode) => {
      if (node.type === 'paragraph' || node.type === 'heading') {
        const textNode = node as ParagraphNode | HeadingNode;
        return textNode.content?.map((child: ProseTextNode) => child.text || '').join('') || '';
      }
      return '';
    })
    .join('\n');
};

export const textToProse = (text: string): ProseDoc => ({
  type: 'doc',
  content: text ? [{ type: 'paragraph', content: [{ type: 'text', text }] }] : []
});

export const proseToHeaderText = (doc?: ProseDoc, fallback = ''): string => {
  const text = proseToText(doc).replace(/\s+/g, ' ').trim();
  return text || fallback;
};

export const isProseDoc = (value: unknown): value is ProseDoc =>
  typeof value === 'object' && value !== null && (value as { type?: unknown }).type === 'doc';

export const resolveLocalizedText = (value?: JSONContent | string | null): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return isProseDoc(value) ? proseToText(value) : '';
};