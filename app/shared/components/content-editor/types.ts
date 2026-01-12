import { Block } from '@blocknote/core';
import { ReactElement } from 'react';

export interface FilePickerModalProps {
  isOpen: boolean;
  onFileSelected: (fileUrl: string) => void;
  onCancel: () => void;
}

export interface BlockNoteEditorProps {
  initialContent?: Block[] | null;
  onChange?: (content: Block[]) => void;
  onSave?: (content: Block[]) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  uploadFile?: (file: File) => Promise<string>;
  customFilePickerModal?: (props: FilePickerModalProps) => ReactElement;
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
