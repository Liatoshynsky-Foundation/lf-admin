import '@tiptap/extension-bold';
import '@tiptap/extension-italic';
import '@tiptap/extension-link';
import { Box, InputBase, Paper, SxProps, Theme, ToggleButton } from '@mui/material';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Link, ListMinus, ListPlus, Table, Trash2, Underline } from 'lucide-react';
import React, { useEffect, useReducer, useState } from 'react';

import { createRequisitesTable } from '../requisites-table/requisitesTable';
import { styles } from './FormattingToolbar.style';
import { sxToArray } from '~/lib/utils/sxToArray';

interface FormattingToolbarProps {
  editor: Editor | null;
  sx?: SxProps<Theme>;
  allowLinks?: boolean;
  allowUnderline?: boolean;
  allowTable?: boolean;
}

export const FormattingToolbar = ({
  editor,
  sx,
  allowLinks = true,
  allowUnderline = false,
  allowTable = false
}: FormattingToolbarProps) => {
  const [isLinkEditing, setIsLinkEditing] = useState(false);
  const [url, setUrl] = useState('');
  // Workaround to prevent formatting toolbar options toggle population across editor
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

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

      const handleUpdate = () => forceUpdate();

      editor.on('transaction', handleUpdate);

      return () => {
        editor.off('transaction', handleUpdate);
      };
    },
    [editor]
  );

  if (!editor) return null;

  const isSelectionEmpty = editor.state.selection.empty;
  const isInTable = allowTable && editor.isActive('table');

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
            sx={styles.linkEditInput}
          />
        </Box>
      ) : (
        <Box sx={styles.toolbarGroup}>
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

          {allowUnderline && (
            <ToggleButton
              sx={styles.toggleButton}
              value="underline"
              selected={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleMark('underline').run()}
              aria-label="underline"
            >
              <Underline />
            </ToggleButton>
          )}

          {allowLinks && (
            <ToggleButton
              sx={styles.toggleButton}
              value="link"
              disabled={isSelectionEmpty && !editor.isActive('link')}
              onClick={startLinkEdit}
              aria-label="link"
            >
              <Link />
            </ToggleButton>
          )}

          {allowTable && !isInTable && (
            <ToggleButton
              sx={styles.toggleButton}
              value="table"
              onClick={() => editor.chain().focus().insertContent(createRequisitesTable()).run()}
              aria-label="table"
              title="Вставити таблицю"
            >
              <Table />
            </ToggleButton>
          )}

          {allowTable && isInTable && (
            <>
              <ToggleButton
                sx={styles.toggleButton}
                value="add-row"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                aria-label="add table row"
                title="Додати рядок"
              >
                <ListPlus />
              </ToggleButton>
              <ToggleButton
                sx={styles.toggleButton}
                value="delete-row"
                disabled={!editor.can().deleteRow()}
                onClick={() => editor.chain().focus().deleteRow().run()}
                aria-label="delete table row"
                title="Видалити рядок"
              >
                <ListMinus />
              </ToggleButton>
              <ToggleButton
                sx={styles.toggleButton}
                value="delete-table"
                onClick={() => editor.chain().focus().deleteTable().run()}
                aria-label="delete table"
                title="Видалити таблицю"
              >
                <Trash2 />
              </ToggleButton>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};
