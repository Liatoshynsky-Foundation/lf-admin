'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import {
  Block,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs
} from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  FormattingToolbarController,
  SuggestionMenuController,
  useCreateBlockNote
} from '@blocknote/react';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { styles } from './BlockNoteEditor.styles';
import { CroppedImageBlock } from './cropped-image-block/CroppedImageBlock';
import { CustomFormattingToolbar } from './custom-formatting-toolbar/CustomFormattingToolbar';
import { BlockNoteEditorProps } from './types';
import { getCustomSlashMenuItems } from '~/lib/utils/getCustomSlashMenuItems';
import { sxToArray } from '~/lib/utils/sxToArray';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

const DEFAULT_EDITOR_SETTINGS = {
  placeholder: 'Почніть вводити текст або використайте "/" для команд...',
  editable: true,
  sideMenu: false,
  minHeight: '800px'
} as const;

const defaultFileUploadHandler = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const customSchema = BlockNoteSchema.create(
  BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      image: CroppedImageBlock()
    },
    inlineContentSpecs: defaultInlineContentSpecs,
    styleSpecs: defaultStyleSpecs
  })
);

export const BlockNoteEditor = (props: BlockNoteEditorProps) => {
  const {
    initialContent,
    onChange,
    fileUpload,
    sx,
    placeholder = DEFAULT_EDITOR_SETTINGS.placeholder,
    editable = DEFAULT_EDITOR_SETTINGS.editable,
    sideMenu = DEFAULT_EDITOR_SETTINGS.sideMenu,
    minHeight = DEFAULT_EDITOR_SETTINGS.minHeight
  } = props;

  const [isMounted, setIsMounted] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const pendingInsertRef = useRef<{ resolve: (url: MediaModalResult | null) => void } | null>(null);

  const uploadHandler = useMemo(() => fileUpload?.handler || defaultFileUploadHandler, [fileUpload?.handler]);

  const handleSilentFileUpload = useCallback(
    async (file: File): Promise<string> => {
      if (fileUpload?.maxFileSize && file.size > fileUpload.maxFileSize) {
        throw new Error('File size exceeds maximum allowed size');
      }
      return uploadHandler(file);
    },
    [uploadHandler, fileUpload?.maxFileSize]
  );

  const editor = useCreateBlockNote(
    {
      schema: customSchema,
      uploadFile: handleSilentFileUpload,
      initialContent: initialContent || undefined,
      placeholders: { default: placeholder }
    },
    [isMounted]
  );

  const openMediaModal = useCallback((): Promise<MediaModalResult | null> => {
    return new Promise((resolve) => {
      pendingInsertRef.current = { resolve };
      setIsMediaModalOpen(true);
    });
  }, []);

  const handleApplyMediaModal = useCallback((result: MediaModalResult) => {
    if (pendingInsertRef.current) {
      pendingInsertRef.current.resolve(result);
      pendingInsertRef.current = null;
    }
    setIsMediaModalOpen(false);
  }, []);

  const handleCloseMediaModal = useCallback(() => {
    if (pendingInsertRef.current) {
      pendingInsertRef.current.resolve(null);
      pendingInsertRef.current = null;
    }
    setIsMediaModalOpen(false);
  }, []);

  const handleEditorChange = useCallback(() => {
    if (onChange && editor) {
      onChange(editor.document as Block[]);
    }
  }, [editor, onChange]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Box sx={{ ...styles.container, minHeight }}>
        <Box sx={styles.loadingPlaceholder}>Завантаження редактора...</Box>
      </Box>
    );
  }

  return (
    <Box sx={[styles.container, ...sxToArray(sx), { minHeight }]}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleEditorChange}
        theme="light"
        sideMenu={sideMenu}
        slashMenu={false}
        formattingToolbar={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => getCustomSlashMenuItems(editor, query, openMediaModal)}
        />
        <FormattingToolbarController
          formattingToolbar={() => (
            <CustomFormattingToolbar
              openMediaModal={openMediaModal}
            />
          )}
        />
      </BlockNoteView>

      <MediaModal
        open={isMediaModalOpen}
        onClose={handleCloseMediaModal}
        onApply={handleApplyMediaModal}
        directory="photos"
      />
    </Box>
  );
};
