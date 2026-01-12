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
  const fileUploadRejectRef = useRef<((error: Error) => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const openDeviceFilePicker = useCallback(async (): Promise<File | null> => {
    console.log('openDeviceFilePicker called');
    return new Promise((resolve) => {
      if (!fileInputRef.current) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.setAttribute('data-custom-file-picker', 'true');
        fileInputRef.current = input;
        document.body.appendChild(input);
      }

      const input = fileInputRef.current;

      const handleChange = () => {
        const file = input.files?.[0] || null;
        resolve(file);
        input.value = '';
        input.removeEventListener('change', handleChange);
      };

      const handleCancel = () => {
        resolve(null);
        input.removeEventListener('cancel', handleCancel);
      };

      input.addEventListener('change', handleChange);
      input.addEventListener('cancel', handleCancel);
      input.click();
    });
  }, []);

  /**
   * Custom upload handler
   */
  //eslint-disable-next-line
  const customUploadHandler = useCallback(async (file: File): Promise<string> => {
    if (fileUploadResolveRef.current) {
      throw new Error('File picker already open');
    }

    return new Promise<string>((resolve, reject) => {
      fileUploadResolveRef.current = resolve;
      fileUploadRejectRef.current = reject;
      setIsFilePickerOpen(true);
    });
  }, []);

  const handleFileSelected = useCallback((fileUrl: string) => {
    if (fileUploadResolveRef.current) {
      if (fileUrl?.trim()) {
        fileUploadResolveRef.current(fileUrl);
      } else {
        fileUploadRejectRef.current?.(new Error('No file URL provided'));
      }
    }

    fileUploadResolveRef.current = null;
    fileUploadRejectRef.current = null;
    setIsFilePickerOpen(false);
  }, []);

  const handleFilePickerCancel = useCallback(() => {
    if (fileUploadRejectRef.current) {
      fileUploadRejectRef.current(new Error('File selection cancelled'));
    }

    fileUploadResolveRef.current = null;
    fileUploadRejectRef.current = null;
    setIsFilePickerOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (fileInputRef.current && document.body.contains(fileInputRef.current)) {
        document.body.removeChild(fileInputRef.current);
      }
    };
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
    uploadFile: customFilePickerModal ? customUploadHandler : uploadFile || defaultHandleUploadFile,
    initialContent: initialContent || undefined,
    dropCursor: multiColumnDropCursor,

    ...(customFilePickerModal && {
      domAttributes: {
        editor: {
          class: 'custom-file-picker-enabled'
        }
      }
    })
  });

  const handleEditorChange = () => {
    const content = editor.document;
    // @ts-expect-error - Type mismatch between custom schema and generic Block type
    onChange?.(content);
  };

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

  // Intercept and block BlockNote's native file input when using custom modal
  useEffect(() => {
    if (!customFilePickerModal) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if this is our custom file picker input - if so, allow it
      if (target && target.hasAttribute && target.hasAttribute('data-custom-file-picker')) {
        console.log('Allowing custom file picker click');
        return; // Allow our custom file picker to work
      }

      // Block clicks on BlockNote's file input elements only
      if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file') {
        console.log('Blocking BlockNote file input click');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Open custom modal instead
        if (!fileUploadResolveRef.current) {
          setIsFilePickerOpen(true);

          // Create promise for file upload
          new Promise<string>((resolve, reject) => {
            fileUploadResolveRef.current = resolve;
            fileUploadRejectRef.current = reject;
          })
            .then((url) => {
              // Insert image block programmatically with the URL
              editor.insertBlocks(
                [
                  {
                    type: 'image',
                    props: {
                      url: url
                    }
                  }
                ],
                editor.getTextCursorPosition().block,
                'after'
              );
            })
            .catch(() => {
              // User cancelled, do nothing
            });
        }

        return false;
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [customFilePickerModal, editor]);

  if (isLoading) {
    return (
      <Box sx={{ ...styles.container, minHeight }}>
        <Box sx={styles.loadingPlaceholder}>Завантаження редактора...</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...styles.container, minHeight }} className={customFilePickerModal ? 'custom-file-picker-enabled' : ''}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleEditorChange}
        theme="light"
        data-theming-css-variables-demo
        sideMenu={true}
      />

      {customFilePickerModal &&
        isFilePickerOpen &&
        customFilePickerModal({
          isOpen: isFilePickerOpen,
          onFileSelected: handleFileSelected,
          onCancel: handleFilePickerCancel,
          onDeviceFilePick: openDeviceFilePicker
        })}
    </Box>
  );
};
