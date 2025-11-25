import type { JSONContent } from '@tiptap/react';

export const isContentEmpty = (content: JSONContent | null | undefined): boolean => {
  if (!content || !content.content || content.content.length === 0) {
    return true;
  }

  const hasContent = content.content.some((node) => {
    if (node.type === 'paragraph') {
      return node.content && node.content.length > 0;
    }
    return true;
  });

  return !hasContent;
};

export const getFirstImage = (content: JSONContent | null | undefined): string | null => {
  if (!content || !content.content) {
    return null;
  }

  const findImage = (node: JSONContent): string | null => {
    if (node.type === 'image' && node.attrs?.src) {
      return node.attrs.src as string;
    }

    if (node.content) {
      for (const child of node.content) {
        const result = findImage(child);
        if (result) return result;
      }
    }

    return null;
  };

  for (const node of content.content) {
    const result = findImage(node);
    if (result) return result;
  }

  return null;
};

export const getAllImages = (content: JSONContent | null | undefined): string[] => {
  if (!content || !content.content) {
    return [];
  }

  const images: string[] = [];

  const findImages = (node: JSONContent): void => {
    if (node.type === 'image' && node.attrs?.src) {
      images.push(node.attrs.src as string);
    }

    if (node.content) {
      node.content.forEach(findImages);
    }
  };

  content.content.forEach(findImages);

  return images;
};

export const validateImageFile = (
  file: File,
  options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } => {
  const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` };
  }

  return { valid: true };
};
