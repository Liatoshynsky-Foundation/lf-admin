import { Block, BlockNoteEditor, BlockSchema, InlineContentSchema, StyleSchema } from '@blocknote/core';
import { SxProps, Theme } from '@mui/material';
import { ReactElement } from 'react';

import { customSchema } from './BlockNoteEditor';

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
  sideMenu?: boolean;
  minHeight?: string;
  fileUpload?: FileUploadConfig;
  keyboardShortcuts?: {
    onSave?: () => void;
  };
  sx?: SxProps<Theme>;
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

export type StrictBlockNoteEditor = BlockNoteEditor<
  typeof customSchema.blockSchema,
  typeof customSchema.inlineContentSchema,
  typeof customSchema.styleSchema
>;

export type CroppedImageProps = {
  textAlignment: 'left' | 'center' | 'right'
  textColor: string;
  url: string;
  cropData: string;
  fileName: string;
  caption: string;
  width: number;
  showPreview: boolean;
};


export type StrictEditor = Omit<BlockNoteEditor<BlockSchema, InlineContentSchema, StyleSchema>, 'updateBlock'> & {

  updateBlock: (
    id: string,
    blockUpdate: { type: 'cropped-image'; props: Partial<CroppedImageProps> } 
  ) => void;
};

export interface CroppedImageRendererProps {
  block: {
    id: string;
    type: 'cropped-image';
    props: CroppedImageProps;
  };
  editor: StrictEditor; 
}

export interface ContentEditorProps {
  initialContent?: SerializedContent | Block[] | null;
  persistence?: ContentPersistence;

  editorConfig?: {
    placeholder?: string;
    sideMenu?: boolean;
    editable?: boolean;
    minHeight?: string;
    fileUpload?: FileUploadConfig;
  };

  renderSaveButton?: (props: { onSave: () => void; isSaving: boolean }) => ReactElement;

  onSaveComplete?: (success: boolean) => void;
  sx?: SxProps<Theme>;
}

export const CONTENT_VERSION = '1.0.0';
