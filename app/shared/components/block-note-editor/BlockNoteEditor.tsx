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
import { useEffect, useState } from 'react';

import { styles } from './BlockNoteEditor.styles';
import { BlockNoteEditorProps } from './types';

async function defaultHandleUploadFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export const BlockNoteEditor = ({
  initialContent,
  onChange,
  onSave,
  //eslint-disable-next-line
  placeholder = 'Почніть вводити текст або використайте "/" для команд...',
  editable = true,
  minHeight = '500px',
  uploadFile
}: BlockNoteEditorProps) => {
  const [isLoading, setIsLoading] = useState(true);

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
    </Box>
  );
};
