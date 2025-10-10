'use client';

import { Box, SxProps, Theme, Typography } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';

import { styles } from './RichTextEditor.styles';

interface RichTextEditorProps {
  title?: string;
  titleSx?: SxProps<Theme>;
  containerStyle?: React.CSSProperties;
}

const RichTextEditor = ({ title = '', titleSx, containerStyle }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Про фундацію</p>',
    editorProps: {
      attributes: {
        style: Object.entries({ ...styles.editor, ...containerStyle })
          .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${value};`)
          .join(' ')
      }
    },
    immediatelyRender: false
  });

  const [showMenu] = React.useState(true);
  const [isEditable] = React.useState(true);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  return (
    <>
      {editor && showMenu && (
        <BubbleMenu editor={editor} options={{ placement: 'top', offset: 8, flip: true }}>
          <Box sx={styles.bubbleMenu}>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              type="button"
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              type="button"
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
              type="button"
            >
              Strike
            </button>
          </Box>
        </BubbleMenu>
      )}
      <Box sx={styles.container}>
        <Typography sx={[styles.title, ...(Array.isArray(titleSx) ? titleSx : [titleSx])]}>{title}</Typography>
        <EditorContent editor={editor} />
      </Box>
    </>
  );
};

export default RichTextEditor;
