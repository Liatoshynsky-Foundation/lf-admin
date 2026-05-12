import { Box, SxProps, Theme } from '@mui/material';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { EditorContent,useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import React, { useEffect, useState } from 'react';

import { styles } from './CustomFormattingField.style';
import { FormattingToolbar } from './formatting-toolbar/FormattingToolbar';
import { sxToArray } from '~/lib/utils/sxToArray';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  sx?: SxProps<Theme>
}
const OneLineDoc = Document.extend({
  content: 'paragraph', 
});

export const CustomFormattingField = ({ value, onChange, label = 'Текст', sx }: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      OneLineDoc,
      Paragraph,
      Text,
      Italic,
      Bold,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          style: 'color: #1976d2; text-decoration: underline;'
        }
      })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false)
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const isActive = isFocused || (editor && !editor.isEmpty);

  return (
    <Box sx={[styles.container, ...sxToArray(sx)]}>
      <Box component="label" onClick={() => editor?.commands.focus()} sx={styles.label(isActive)}>
        {label}
      </Box>

      <Box component="fieldset" sx={styles.fieldset(isFocused)}>
        <Box
          component="legend"
          sx={{
            display: 'block',
            fontSize: '12px',
            maxWidth: isActive ? '100%' : '0',
            transition: 'max-width 0.2s',
            visibility: 'hidden'
          }}
        >
          <span>{label}</span>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          padding: '0 16px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {editor && (
          <BubbleMenu editor={editor}>
            <FormattingToolbar editor={editor} />
          </BubbleMenu>
        )}

        <Box sx={styles.input}>
          <EditorContent editor={editor} />
        </Box>
      </Box>
    </Box>
  );
};
