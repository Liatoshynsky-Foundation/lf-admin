import { Box, FormControl, FormHelperText, InputLabel, OutlinedInput, SxProps, Theme } from '@mui/material';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react';
// @ts-expect-error - Skip legacy node10 resolution checks for this specific modern subpath
import { BubbleMenu } from '@tiptap/react/menus';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { styles } from './CustomFormattingField.style';
import { FormattingToolbar } from './formatting-toolbar/FormattingToolbar';
import { requisitesTableExtensions } from './requisites-table/requisitesTable';
import { sxToArray } from '~/lib/utils/sxToArray';

export interface Props {
  value?: JSONContent | string;
  onChange: (value: JSONContent) => void;
  label?: string;
  sx?: SxProps<Theme>;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
  editable?: boolean;
  allowLinks?: boolean;
  allowUnderline?: boolean;
  allowTable?: boolean;
  variant?: 'multiline' | 'singleLine';
}

const FormattingDoc = Document.extend({
  content: 'paragraph+'
});

const TableFormattingDoc = Document.extend({
  content: '(paragraph | table)+'
});

type ShouldShowProps = {
  editor: { isEditable: boolean };
  view: { hasFocus: () => boolean };
};

const showToolbarWhileFocused = ({ editor, view }: ShouldShowProps) => editor.isEditable && view.hasFocus();

interface EditorInputHandle {
  focus: () => void;
}

interface EditorInputProps extends InputBaseComponentProps {
  editor: Editor | null;
  allowLinks: boolean;
  allowUnderline: boolean;
  allowTable: boolean;
}

const hasFormattingContent = (content?: JSONContent): boolean => {
  if (!content) return false;

  if (typeof content.text === 'string' && content.text.trim().length > 0) {
    return true;
  }

  return Array.isArray(content.content) && content.content.some(hasFormattingContent);
};

const EditorInput = React.forwardRef<EditorInputHandle, EditorInputProps>(function EditorInput(
  { editor, className, allowLinks, allowUnderline, allowTable },
  ref
) {
  useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus()
  }));

  return (
    <Box className={className} sx={styles.input()}>
      {editor && (
        <BubbleMenu editor={editor} {...(allowTable && { shouldShow: showToolbarWhileFocused })}>
          <FormattingToolbar
            editor={editor}
            allowLinks={allowLinks}
            allowUnderline={allowUnderline}
            allowTable={allowTable}
          />
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </Box>
  );
});

export const CustomFormattingField = ({
  value,
  onChange,
  label = 'Текст',
  sx,
  error = false,
  helperText,
  onBlur,
  editable = true,
  allowLinks = true,
  allowUnderline = false,
  allowTable = false,
  variant = 'multiline'
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

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
      allowTable ? TableFormattingDoc : FormattingDoc,
      Paragraph,
      Text,
      Italic,
      Bold,
      Underline,
      ...(allowLinks
        ? [
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              target: '_blank',
              rel: 'noopener noreferrer',
              style: 'color: #1976d2; text-decoration: underline;'
            }
          })
        ]
        : []),
      ...(allowTable ? requisitesTableExtensions : [])
    ],
    content: value,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
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

    const currentContent = editor.getJSON();

    if (JSON.stringify(currentContent) !== valueStr) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (pendingUpdateRef.current) {
        onChangeRef.current(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
    };
  }, []);

  const isActive = Boolean(
    isFocused ||
      (editor && !editor.isEmpty) ||
      (typeof value === 'string' ? value.trim().length > 0 : hasFormattingContent(value))
  );

  return (
    <FormControl fullWidth error={error} focused={isFocused} sx={[styles.container(error), ...sxToArray(sx)]}>
      <InputLabel shrink={isActive} onClick={() => editor?.commands.focus()}>
        {label}
      </InputLabel>

      <OutlinedInput
        label={label}
        notched={isActive}
        inputComponent={EditorInput}
        inputProps={{
          editor,
          allowLinks,
          allowUnderline,
          allowTable
        }}
        sx={styles.outlined(variant)}
      />

      {error && helperText && <FormHelperText data-testid="formatting-field-error">{helperText}</FormHelperText>}
    </FormControl>
  );
};
