import { Block } from '@blocknote/core';
import { ReactElement } from 'react';

export interface FilePickerModalProps {
  isOpen: boolean;
  onFileSelected: (file: File | null, fileUrl?: string) => void;
  onCancel: () => void;
  onDeviceFilePick?: () => Promise<void>;
}

export interface FileUploadConfig {
  handler?: (file: File) => Promise<string>;
  customModal?: (props: FilePickerModalProps) => ReactElement;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

export interface BlockNoteEditorProps {
  initialContent?: Block[] | null;
  onChange?: (content: Block[]) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  fileUpload?: FileUploadConfig;
  keyboardShortcuts?: {
    onSave?: () => void;
  };
}

export interface SerializedContent {
  blocks: Block[];
  version: string;
  lastModified: string;
}

export interface ContentPersistence {
  onSave?: (content: SerializedContent) => Promise<boolean>;
  onChange?: (content: SerializedContent) => void;
  autoSaveInterval?: number;
}

export interface ContentEditorProps {
  initialContent?: SerializedContent | Block[] | null;
  persistence?: ContentPersistence;

  editorConfig?: {
    placeholder?: string;
    editable?: boolean;
    minHeight?: string;
    fileUpload?: FileUploadConfig;
  };

  renderSaveButton?: (props: { onSave: () => void; isSaving: boolean }) => ReactElement;

  onSaveComplete?: (success: boolean) => void;
}

export const CONTENT_VERSION = '1.0.0';
