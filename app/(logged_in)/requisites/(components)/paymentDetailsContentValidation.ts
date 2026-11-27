import type { JSONContent } from '@tiptap/react';

interface ContentValidationResult {
  hasContent: boolean;
  hasMeaningfulText: boolean;
}

const inspectContent = (node: JSONContent): ContentValidationResult => {
  if (node.type === 'text') {
    const text = node.text ?? '';

    return {
      hasContent: text.length > 0,
      hasMeaningfulText: text.trim().length > 0
    };
  }

  if (node.type === 'hardBreak') {
    return {
      hasContent: true,
      hasMeaningfulText: false
    };
  }

  const children = (node.content ?? []).map(inspectContent);

  return {
    hasContent: children.some((child) => child.hasContent),
    hasMeaningfulText: children.some((child) => child.hasMeaningfulText)
  };
};

export const isPaymentDetailsTabValid = (content: JSONContent): boolean => {
  const result = inspectContent(content);

  if (result.hasMeaningfulText) {
    return true;
  }

  const paragraphs = content.content ?? [];
  const hasMultipleEmptyParagraphs =
    paragraphs.filter((node) => node.type === 'paragraph' && !node.content?.length).length > 1;

  return !result.hasContent && !hasMultipleEmptyParagraphs;
};
