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
import React, { useEffect, useRef, useState } from 'react';

import { styles } from './CustomFormattingField.style';
import { FormattingToolbar } from './formatting-toolbar/FormattingToolbar';
import { sxToArray } from '~/lib/utils/sxToArray';

export interface Props {
  value?: JSONContent | string;
  onChange: (value: JSONContent) => void;
  label?: string;
  sx?: SxProps<Theme>;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
}
const FormattingDoc = Document.extend({
  content: 'paragraph+'
});

const hasFormattingContent = (content?: JSONContent): boolean => {
  if (!content) return false;

  if (typeof content.text === 'string' && content.text.trim().length > 0) {
    return true;
  }

  return Array.isArray(content.content) && content.content.some(hasFormattingContent);
};

export const CustomFormattingField = ({
  value,
  onChange,
  label = 'Текст',
  sx,
  error = false,
  helperText,
  onBlur
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const lastSentRef = useRef<string | undefined>(undefined);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<JSONContent | null>(null);

  const flushUpdate = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingUpdateRef.current) {
      onChangeRef.current(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
  };

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
      const json = editor.getJSON();
      lastSentRef.current = JSON.stringify(json);
      pendingUpdateRef.current = json;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        flushUpdate();
      }, 300);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      setIsFocused(false);
      flushUpdate();
      onBlur?.();
    }
  });

  useEffect(() => {
    if (!editor) return;

    const isValueEmpty =
      !value ||
      (typeof value === 'string'
        ? value.trim().length === 0
        : Object.keys(value).length === 0 ||
          (value.type === 'doc' && Array.isArray(value.content) && value.content.length === 0));

    if (isValueEmpty) {
      if (!editor.isEmpty) {
        editor.commands.setContent('', { emitUpdate: false });
      }
      return;
    }

    if (typeof value === 'string') {
      const currentText = editor.getText();
      const strippedValue = (value as string).replace(/<[^>]*>?/gm, '');
      if (currentText !== strippedValue) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
      return;
    }

    const valueStr = JSON.stringify(value);
    if (valueStr === lastSentRef.current) {
      return;
    }

    const currentContent = editor.getJSON();
    const isNotEqual = JSON.stringify(currentContent) !== valueStr;

    if (isNotEqual) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isActive = Boolean(
    isFocused || 
    (editor && !editor.isEmpty) || 
    (typeof value === 'string' ? value.trim().length > 0 : hasFormattingContent(value))
  );

  return (
    <Box sx={[styles.container(error), ...sxToArray(sx)]}>
      <Box component="label" onClick={() => editor?.commands.focus()} sx={styles.label(isActive, error)}>
        {label}
      </Box>

      <Box component="fieldset" sx={styles.fieldset(isFocused, error)}>
        <Box
          component="legend"
          sx={styles.legend(isActive, error)}
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
