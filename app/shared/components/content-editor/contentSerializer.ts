import { Block } from '@blocknote/core';

import { CONTENT_VERSION, SerializedContent } from './types';

export const serializeContent = (blocks: Block[]): SerializedContent => {
  return {
    blocks,
    version: CONTENT_VERSION,
    lastModified: new Date().toISOString()
  };
};

export const deserializeContent = (content: SerializedContent | Block[] | null | undefined): Block[] | null => {
  if (!content) {
    return null;
  }

  if (Array.isArray(content)) {
    return content;
  }

  if ('blocks' in content && 'version' in content) {
    return content.blocks;
  }

  return null;
};

export const validateContent = (content: unknown): content is Block[] => {
  if (!Array.isArray(content)) {
    return false;
  }

  return content.every((block) => typeof block === 'object' && block !== null && 'id' in block && 'type' in block);
};

export const isContentEmpty = (blocks: Block[] | null | undefined): boolean => {
  if (!blocks || blocks.length === 0) {
    return true;
  }

  return blocks.every(
    (block) => block.type === 'paragraph' && (!('content' in block) || !block.content || block.content.length === 0)
  );
};

export const isContentEqual = (a: Block[] | null | undefined, b: Block[] | null | undefined): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  return JSON.stringify(a) === JSON.stringify(b);
};

export const cloneContent = (blocks: Block[]): Block[] => {
  return structuredClone(blocks);
};
