import { Block } from '@blocknote/core';

export interface BlockNoteEditorProps {
  initialContent?: Block[] | null;
  onChange?: (content: Block[]) => void;
  onSave?: (content: Block[]) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  uploadFile?: (file: File) => Promise<string>;
}

export interface EditorContent {
  blocks: Block[];
  lastModified?: Date;
  version?: string;
}

export interface BlockNoteEditorConfig {
  features?: {
    images?: boolean;
    tables?: boolean;
    codeBlocks?: boolean;
    fileUploads?: boolean;
  };
  maxFileSize?: number;
  allowedFileTypes?: string[];
}
