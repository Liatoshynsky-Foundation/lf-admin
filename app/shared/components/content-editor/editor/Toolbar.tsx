import {
  Code,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatUnderlined,
  HorizontalRule,
  Image as ImageIcon,
  Link as LinkIcon,
  Redo,
  Undo
} from '@mui/icons-material';
import type { Editor } from '@tiptap/react';
import React, { useRef } from 'react';

import { ToolbarContainer, ToolbarDivider } from '../styles';
import type { HeadingLevel, ToolbarProps } from '../types';
import { ToolbarButton } from './ToolbarButton';

const HeadingButton: React.FC<{
  editor: Editor;
  level: HeadingLevel;
}> = ({ editor, level }) => (
  <ToolbarButton
    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
    isActive={editor.isActive('heading', { level })}
    disabled={!editor.can().chain().focus().toggleHeading({ level }).run()}
    icon={<span style={{ fontSize: '14px', fontWeight: 'bold' }}>H{level}</span>}
    label={`Heading ${level}`}
  />
);

export const Toolbar: React.FC<ToolbarProps> = ({ editor, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const handleAddLink = () => {
    const url = window.prompt('Enter URL:');

    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !onImageUpload) return;

    try {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <ToolbarContainer>
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        icon={<Undo />}
        label="Undo"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        icon={<Redo />}
        label="Redo"
      />

      <ToolbarDivider />

      <HeadingButton editor={editor} level={1} />
      <HeadingButton editor={editor} level={2} />
      <HeadingButton editor={editor} level={3} />

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        icon={<FormatBold />}
        label="Bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        icon={<FormatItalic />}
        label="Italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        icon={<FormatUnderlined />}
        label="Underline"
      />

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        icon={<FormatListBulleted />}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        icon={<FormatListNumbered />}
        label="Numbered List"
      />

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        icon={<FormatQuote />}
        label="Blockquote"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        icon={<Code />}
        label="Code Block"
      />

      <ToolbarDivider />

      <ToolbarButton onClick={handleAddLink} isActive={editor.isActive('link')} icon={<LinkIcon />} label="Add Link" />

      {onImageUpload && (
        <>
          <ToolbarButton onClick={handleImageClick} icon={<ImageIcon />} label="Add Image" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </>
      )}

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        icon={<HorizontalRule />}
        label="Horizontal Rule"
      />
    </ToolbarContainer>
  );
};
