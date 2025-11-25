import type { Editor, JSONContent } from '@tiptap/react';

export interface ContentEditorProps {
  initialContent?: JSONContent;
  placeholder?: string;
  onChange?: (content: JSONContent) => void;
  onSave?: (content: JSONContent) => void;
  onImageUpload?: (file: File) => Promise<string>;
  showSaveButton?: boolean;
  className?: string;
  readOnly?: boolean;
  minHeight?: string;
}

export interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

export interface ToolbarProps {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
}

export interface ImageUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export enum ContentNodeType {
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  STRIKE = 'strike',
  CODE = 'code',
  CODE_BLOCK = 'codeBlock',
  BLOCKQUOTE = 'blockquote',
  BULLET_LIST = 'bulletList',
  ORDERED_LIST = 'orderedList',
  LIST_ITEM = 'listItem',
  LINK = 'link',
  IMAGE = 'image',
  HARD_BREAK = 'hardBreak',
  HORIZONTAL_RULE = 'horizontalRule',
  TEXT = 'text'
}

export interface ContentNode {
  type: ContentNodeType | string;
  attrs?: Record<string, unknown>;
  content?: ContentNode[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
}
