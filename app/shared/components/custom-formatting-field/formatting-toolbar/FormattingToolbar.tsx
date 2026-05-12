import '@tiptap/extension-bold';
import '@tiptap/extension-italic';
import '@tiptap/extension-link';
import { Box, InputBase, Paper, SxProps, Theme, ToggleButton } from '@mui/material';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Link } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { styles } from './FormattingToolbar.style';
import { sxToArray } from '~/lib/utils/sxToArray';

interface FormattingToolbarProps {
  editor: Editor | null;
  sx?: SxProps<Theme>
}

export const FormattingToolbar = ({ editor, sx }: FormattingToolbarProps) => {
  const [isLinkEditing, setIsLinkEditing] = useState(false);
  const [url, setUrl] = useState('');
  // Workaround to prevent formatting toolbar options toggle population across editor
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleSelectionChange = () => setIsLinkEditing(false);
    editor?.on('selectionUpdate', handleSelectionChange);
    return () => {
      editor?.off('selectionUpdate', handleSelectionChange);
    };
  }, [editor]);

  useEffect(
    function preventFormattingPopulation() {
      if (!editor) return;

      const handleUpdate = () => forceUpdate((prev) => prev + 1);

      editor.on('transaction', handleUpdate);

      return () => {
        editor.off('transaction', handleUpdate);
      };
    },
    [editor]
  );

  if (!editor) return null;

  const isSelectionEmpty = editor.state.selection.empty;

  const startLinkEdit = () => {
    setUrl(editor.getAttributes('link').href || '');
    setIsLinkEditing(true);
  };

  const handleLinkSubmit = () => {
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setIsLinkEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLinkSubmit();
    }
  };

  return (
    <Paper elevation={4} sx={[styles.container, ...sxToArray(sx)]}>
      {isLinkEditing ? (
        <Box sx={styles.linkEditInputContainer}>
          <InputBase
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleLinkSubmit}
            placeholder="Вставте гіперпосилання..."
            autoFocus
            sx={{ flex: 1, fontSize: '14px' }}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <ToggleButton
            sx={styles.toggleButton}
            value="bold"
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleMark('bold').run()}
            aria-label="bold"
          >
            <Bold />
          </ToggleButton>
          <ToggleButton
            sx={styles.toggleButton}
            value="italic"
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleMark('italic').run()}
            aria-label="italic"
          >
            <Italic />
          </ToggleButton>

          <ToggleButton
            sx={styles.toggleButton}
            value="link"
            disabled={isSelectionEmpty && !editor.isActive('link')}
            onClick={startLinkEdit}
            aria-label="link"
          >
            <Link />
          </ToggleButton>
        </Box>
      )}
    </Paper>
  );
};
