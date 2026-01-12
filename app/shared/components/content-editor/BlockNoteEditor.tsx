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
import { useCallback, useEffect, useRef, useState } from 'react';

import { styles } from './BlockNoteEditor.styles';
import { BlockNoteEditorProps } from './types';

export const BlockNoteEditor = ({
  initialContent,
  onChange,
  onSave,
  //eslint-disable-next-line
  placeholder = 'Почніть вводити текст або використайте "/" для команд...',
  editable = true,
  minHeight = '500px',
  uploadFile,
  customFilePickerModal
}: BlockNoteEditorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const fileUploadResolveRef = useRef<((url: string) => void) | null>(null);
  const hasCustomFilePicker = !!customFilePickerModal;

  const defaultHandleUploadFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const openCustomFilePicker = useCallback(() => {
    setIsFilePickerOpen(true);

    return new Promise<string>((resolve) => {
      fileUploadResolveRef.current = resolve;
    });
  }, []);

  const handleFileSelected = useCallback((fileUrl: string) => {
    if (fileUploadResolveRef.current) {
      fileUploadResolveRef.current(fileUrl);
      fileUploadResolveRef.current = null;
    }
    setIsFilePickerOpen(false);
  }, []);

  const handleFilePickerCancel = useCallback(() => {
    if (fileUploadResolveRef.current) {
      fileUploadResolveRef.current('');
      fileUploadResolveRef.current = null;
    }
    setIsFilePickerOpen(false);
  }, []);

  const schema = withMultiColumn(
    BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs
      },
      inlineContentSpecs: {
        ...defaultInlineContentSpecs
      },
      styleSpecs: {
        ...defaultStyleSpecs
      }
    })
  );

  const editor = useCreateBlockNote({
    schema,
    uploadFile: uploadFile || defaultHandleUploadFile,
    initialContent: initialContent || undefined,
    dropCursor: multiColumnDropCursor
  });

  const handleEditorChange = () => {
    const content = editor.document;
    // @ts-expect-error - Type mismatch between custom schema and generic Block type
    onChange?.(content);
  };

  // Handle keyboard shortcuts for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S (Mac) or Ctrl+S (Windows/Linux) to save
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

  /**
   * Override native file inputs
   * If no custom modal, use the editor's default file picker behavior
   */
  useEffect(() => {
    if (!editor || !hasCustomFilePicker) return;

    const handleFileInputClick = (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file') {
        e.preventDefault();
        e.stopPropagation();

        openCustomFilePicker().then((fileUrl) => {
          if (fileUrl) {
            editor.insertBlocks(
              [
                {
                  type: 'image',
                  props: {
                    url: fileUrl
                  }
                }
              ],
              editor.getTextCursorPosition().block,
              'after'
            );
          }
        });
      }
    };

    document.addEventListener('click', handleFileInputClick, true);

    return () => {
      document.removeEventListener('click', handleFileInputClick, true);
    };
  }, [editor, hasCustomFilePicker, openCustomFilePicker]);

  if (isLoading) {
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

      {hasCustomFilePicker &&
        customFilePickerModal({
          isOpen: isFilePickerOpen,
          onFileSelected: handleFileSelected,
          onCancel: handleFilePickerCancel
        })}
    </Box>
  );
};
