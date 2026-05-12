import '@tiptap/extension-bold';
import '@tiptap/extension-italic';
import '@tiptap/extension-link';
import { Paper, SxProps, Theme, ToggleButton } from '@mui/material';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Link } from 'lucide-react';
import React, { useState } from 'react';

import { LinkModal } from '../link-modal/LinkModal';
import { styles } from './FormattingToolbar.style';
import { sxToArray } from '~/lib/utils/sxToArray';

interface FormattingToolbarProps {
  editor: Editor | null;
  sx?: SxProps<Theme>
}

export const FormattingToolbar = ({ editor, sx }: FormattingToolbarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!editor) return null;

  const handleLinkSubmit = (url: string) => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setIsModalOpen(false);
  };

  return (
    <Paper elevation={4} sx={[styles.container, ...sxToArray(sx)]} onMouseDown={(e) => e.preventDefault()}>
      <ToggleButton
        sx={styles.toggleButton}
        value="bold"
        selected={editor.isActive('bold')}
        onChange={() => editor.chain().focus().toggleMark('bold').run()}
        aria-label="bold"
      >
        <Bold />
      </ToggleButton>
      <ToggleButton
        sx={styles.toggleButton}
        value="italic"
        selected={editor.isActive('italic')}
        onChange={() => editor.chain().focus().toggleMark('italic').run()}
        aria-label="italic"
      >
        <Italic />
      </ToggleButton>

      <ToggleButton
        sx={styles.toggleButton}
        value="link"
        selected={editor.isActive('link')}
        onChange={() => setIsModalOpen(true)}
        aria-label="link"
      >
        <Link />
      </ToggleButton>

      <LinkModal
        isOpen={isModalOpen}
        initialUrl={editor.getAttributes('link').href}
        onSubmit={handleLinkSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </Paper>
  );
};
