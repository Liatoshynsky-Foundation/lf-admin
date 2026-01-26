'use client';

// @ts-expect-error editor type error
import '@blocknote/core/fonts/inter.css';
// @ts-expect-error editor type error
import '@blocknote/mantine/style.css';
import { BlockNoteSchema, defaultBlockSpecs, defaultInlineContentSpecs, defaultStyleSpecs } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { multiColumnDropCursor, withMultiColumn } from '@blocknote/xl-multi-column';
import { Box } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { styles } from './BlockNoteEditor.styles';
import { BlockNoteEditorProps } from './types';
import { useFilePickerUpload } from './useFilePickerUpload';

export const BlockNoteEditor = ({
  initialContent,
  onChange,
  onSave,

  placeholder = 'Почніть вводити текст або використайте "/" для команд...',
  editable = true,
  minHeight = '800px',
  uploadFile,
  customFilePickerModal
}: BlockNoteEditorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const defaultHandleUploadFile = useCallback(async (file: File): Promise<string> => {
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
  }, []);

  const { openCustomPicker, modalProps } = useFilePickerUpload({
    customFilePickerModal
  });

  const handleFileUpload = useCallback(
    async (file: File): Promise<string> => {
      const handler = uploadFile || defaultHandleUploadFile;
      return handler(file);
    },
    [uploadFile, defaultHandleUploadFile]
  );

  const schema = BlockNoteSchema.create({
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

  const wrappedSchema = withMultiColumn(schema);

  const editor = useCreateBlockNote(
    {
      schema: wrappedSchema,
      uploadFile: async (file: File) => {
        return handleFileUpload(file);
      },
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!openCustomPicker || !editor) {
      return;
    }

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target instanceof HTMLInputElement && target.type === 'file') {
        if (target.getAttribute('data-custom-file-picker') === 'true') {
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
                  } as any
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

    document.addEventListener('click', handleClick, true);

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      if (
        target instanceof HTMLInputElement &&
        target.type === 'file' &&
        target.getAttribute('data-custom-file-picker') === 'true'
      ) {
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

    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('focus', handleFocus, true);
    };
  }, [openCustomPicker, handleFileUpload, editor]);

  const handleEditorChange = () => {
    const content = editor.document;
    // @ts-expect-error - Type mismatch between custom schema and generic Block type
    onChange?.(content);
  };

  /**
   * Handle keyboard shortcuts (Cmd/Ctrl + S to save)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const content = editor.document;
        // @ts-expect-error - Type mismatch between custom schema and generic Block type
        onSave?.(content);
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <Box sx={{ ...styles.container, minHeight }}>
        <Box sx={styles.loadingPlaceholder}>Завантаження редактора...</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...styles.container, minHeight }}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleEditorChange}
        theme="light"
        data-theming-css-variables-demo
        sideMenu={true}
      />

      {modalProps && customFilePickerModal?.(modalProps)}
    </Box>
  );
};
