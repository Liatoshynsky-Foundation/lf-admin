'use client';

import { Save as SaveIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';

import { ImageUploadExtension } from '../helpers/ImageUpload';
import { EditorContainer, EditorContent as StyledEditorContent, SaveButtonContainer } from '../styles';
import type { ContentEditorProps } from '../types';
import { Toolbar } from './Toolbar';

export const Editor: React.FC<ContentEditorProps> = ({
  initialContent,
  placeholder = 'Start writing...',
  onChange,
  onSave,
  onImageUpload,
  showSaveButton = true,
  className,
  readOnly = false,
  minHeight
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      ImageUploadExtension.configure({
        onImageUpload
      })
    ],
    content: initialContent || '',
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON());
      }
    }
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  const handleSave = () => {
    if (editor && onSave) {
      onSave(editor.getJSON());
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <EditorContainer className={className} elevation={0}>
      {!readOnly && <Toolbar editor={editor} onImageUpload={onImageUpload} />}

      <StyledEditorContent minHeight={minHeight}>
        <EditorContent editor={editor} />
      </StyledEditorContent>

      {!readOnly && showSaveButton && onSave && (
        <SaveButtonContainer>
          <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </SaveButtonContainer>
      )}
    </EditorContainer>
  );
};

export const useContentEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false
      }),
      ImageUploadExtension
    ],
    editable: false,
    immediatelyRender: false
  });

  return editor;
};
