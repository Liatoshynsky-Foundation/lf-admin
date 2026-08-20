import { Box, SxProps, Theme } from '@mui/material';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
// @ts-expect-error - Skip legacy node10 resolution checks for this specific modern subpath
import { BubbleMenu } from '@tiptap/react/menus';
import React, { useEffect, useState } from 'react';

import { styles } from './CustomFormattingField.style';
import { FormattingToolbar } from './formatting-toolbar/FormattingToolbar';
import { sxToArray } from '~/lib/utils/sxToArray';

export interface Props {
  value?: JSONContent;
  onChange: (value: JSONContent) => void;
  label?: string;
  sx?: SxProps<Theme>;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
  multiline?: boolean;
}
const FormattingDoc = Document.extend({
  content: 'paragraph+'
});

export const CustomFormattingField = ({ value, onChange, label = 'Текст', sx, error = false, helperText, onBlur}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      FormattingDoc,
      Paragraph,
      Text,
      Italic,
      Bold,
      Underline,
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
      onChange(editor.getJSON());
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      setIsFocused(false);
      onBlur?.();
    }
  });

  useEffect(() => {
    if (!editor || !value) return;
    const currentContent = editor.getJSON();
    const newContent = value;

    const isNotEqual = JSON.stringify(currentContent) !== JSON.stringify(newContent);
    
    if (isNotEqual)  editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  const isActive = Boolean(isFocused || (editor && !editor.isEmpty));

  return (
    <Box sx={[styles.container, ...sxToArray(sx)]}>
      <Box component="label" onClick={() => editor?.commands.focus()} sx={styles.label(isActive, error)}>
        {label}
      </Box>

      <Box component="fieldset" sx={styles.fieldset(isFocused, error)}>
        <Box
          component="legend"
          sx={styles.legend(isActive)}
        >
          <span>{label}</span>
        </Box>
      </Box>

      <Box
        sx={styles.contentWrapper}
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

      {error && helperText && (
        <Box sx={styles.helperText} data-testid="formatting-field-error">
          {helperText}
        </Box>
      )}
    </Box>
  );
};
