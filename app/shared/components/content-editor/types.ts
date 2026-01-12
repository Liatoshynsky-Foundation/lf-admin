import { Block } from '@blocknote/core';
import { ReactElement } from 'react';

export interface FilePickerModalProps {
  isOpen: boolean;
  /**
   * Call this when a file is selected from any source (gallery, cloud storage, etc.)
   * @param file - The selected File object (required)
   * @param fileUrl - Optional preview URL (not currently used)
   */
  onFileSelected: (file: File | null, fileUrl?: string) => void;
  /**
   * Call this to cancel the file selection and close the modal
   */
  onCancel: () => void;
  /**
   * Call this to open the device's native file picker.
   * When a file is selected, it will automatically be handled (modal will close).
   * When cancelled, the modal stays open so the user can try another option.
   */
  onDeviceFilePick?: () => Promise<void>;
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
