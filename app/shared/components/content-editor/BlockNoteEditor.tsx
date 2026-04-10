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
import { useCreateBlockNote } from '@blocknote/react';
import { multiColumnDropCursor, withMultiColumn } from '@blocknote/xl-multi-column';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { styles } from './BlockNoteEditor.styles';
import { BlockNoteEditorProps } from './types';
import { useFilePickerUpload } from './useFilePickerUpload';
import { sxToArray } from '~/lib/utils/sxToArray';

const defaultFileUploadHandler = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        resolve(result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

export const BlockNoteEditor = ({
  initialContent,
  onChange,
  placeholder = 'Почніть вводити текст або використайте "/" для команд...',
  editable = true,
  sideMenu = false,
  minHeight = '800px',
  fileUpload,
  keyboardShortcuts,
  sx
}: BlockNoteEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const uploadHandler = useMemo(() => fileUpload?.handler || defaultFileUploadHandler, [fileUpload?.handler]);

  const { openCustomPicker, modalProps } = useFilePickerUpload({
    customFilePickerModal: fileUpload?.customModal
  });

  const handleFileUpload = useCallback(
    async (file: File): Promise<string> => {
      if (fileUpload?.maxFileSize && file.size > fileUpload.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${fileUpload.maxFileSize} bytes`);
      }

      if (fileUpload?.allowedMimeTypes && !fileUpload.allowedMimeTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      return uploadHandler(file);
    },
    [uploadHandler, fileUpload?.maxFileSize, fileUpload?.allowedMimeTypes]
  );

  const schema = useMemo(() => {
    const baseSchema = BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs
      },
      inlineContentSpecs: {
        ...defaultInlineContentSpecs
      },
      styleSpecs: {
        ...defaultStyleSpecs
      }
    });

    return withMultiColumn(baseSchema);
  }, []);

  const editor = useCreateBlockNote(
    {
      schema,
      uploadFile: handleFileUpload,
      initialContent: initialContent || undefined,
      dropCursor: multiColumnDropCursor,
      placeholderText: placeholder
    },
    [isMounted]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!openCustomPicker || !editor) {
      return;
    }

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target instanceof HTMLInputElement && target.type === 'file') {
        if (target.dataset.customFilePicker === 'true') {
          return;
        }

        const isBlockNoteFileInput =
          target.accept?.includes('image') ||
          target.closest('[data-node-type]') ||
          target.id?.includes('blocknote') ||
          target.closest('.bn-');

        if (isBlockNoteFileInput) {
          event.preventDefault();
          event.stopImmediatePropagation();

          try {
            const selectedFile = await openCustomPicker();
            if (selectedFile) {
              const fileUrl = await handleFileUpload(selectedFile);

              const currentBlock = editor.getTextCursorPosition().block;
              editor.insertBlocks(
                [
                  {
                    type: 'image',
                    props: {
                      url: fileUrl,
                      name: selectedFile.name
                    }
                  }
                ],
                currentBlock,
                'after'
              );
            }
          } catch (error) {
            console.error('Error handling file selection:', error);
          }
        }
      }
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      if (target instanceof HTMLInputElement && target.type === 'file' && target.dataset.customFilePicker === 'true') {
        return;
      }

      if (
        target instanceof HTMLInputElement &&
        target.type === 'file' &&
        (target.accept?.includes('image') || target.closest('[data-node-type]'))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('focus', handleFocus, true);
    };
  }, [openCustomPicker, handleFileUpload, editor]);

  const handleEditorChange = useCallback(() => {
    if (onChange) {
      const content = editor.document;
      onChange(content as Block[]);
    }
  }, [editor, onChange]);

  useEffect(() => {
    if (!keyboardShortcuts?.onSave) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        keyboardShortcuts.onSave?.();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcuts]);

  if (!isMounted) {
    return (
      <Box sx={{ ...styles.container, minHeight }}>
        <Box sx={styles.loadingPlaceholder}>Завантаження редактора...</Box>
      </Box>
    );
  }

  return (
    <Box sx={[
      styles.container,
      ...sxToArray(sx),
      {minHeight},
    ]}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleEditorChange}
        theme="light"
        data-theming-css-variables-demo
        sideMenu={sideMenu}
      />

      {modalProps && fileUpload?.customModal?.(modalProps)}
    </Box>
  );
};
