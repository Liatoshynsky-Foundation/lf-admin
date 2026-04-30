'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import {
  Block,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs
} from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { multiColumnDropCursor, withMultiColumn } from '@blocknote/xl-multi-column';
import { Box } from '@mui/material';
import { Image as ImageIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { styles } from './BlockNoteEditor.styles';
import { BlockNoteEditorProps } from './types';
import { sxToArray } from '~/lib/utils/sxToArray';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

const defaultFileUploadHandler = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const BlockNoteEditor = ({
  initialContent,
  onChange,
  placeholder = 'Почніть вводити текст або використайте "/" для команд...',
  editable = true,
  sideMenu = false,
  minHeight = '800px',
  fileUpload,
  sx
}: BlockNoteEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const pendingInsertRef = useRef<{ resolve: (url: string | null) => void } | null>(null);

  const uploadHandler = useMemo(() => fileUpload?.handler || defaultFileUploadHandler, [fileUpload?.handler]);

  
  const handleSilentFileUpload = useCallback(
    async (file: File): Promise<string> => {
      if (fileUpload?.maxFileSize && file.size > fileUpload.maxFileSize) {
        throw new Error('File size exceeds maximum allowed size');
      }
      return uploadHandler(file);
    },
    [uploadHandler, fileUpload?.maxFileSize]
  );

  const schema = useMemo(() => {
    return withMultiColumn(
      BlockNoteSchema.create({
        blockSpecs: defaultBlockSpecs,
        inlineContentSpecs: defaultInlineContentSpecs,
        styleSpecs: defaultStyleSpecs
      })
    );
  }, []);

  const editor = useCreateBlockNote(
    {
      schema,
      uploadFile: handleSilentFileUpload, 
      initialContent: initialContent || undefined,
      dropCursor: multiColumnDropCursor,
      placeholders: { default: placeholder }
    },
    [isMounted]
  );

  const openMediaModal = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      pendingInsertRef.current = { resolve };
      setIsMediaModalOpen(true);
    });
  }, []);

  const handleApplyMediaModal = useCallback((result: MediaModalResult) => {
    const { selected, uploadResult } = result;
    const url = uploadResult?.url ?? (selected.kind === 'upload' ? null : selected.src);

    if (pendingInsertRef.current) {
      pendingInsertRef.current.resolve(url || null);
      pendingInsertRef.current = null;
    }
    setIsMediaModalOpen(false);
  }, []);

  const handleCloseMediaModal = useCallback(() => {
    if (pendingInsertRef.current) {
      pendingInsertRef.current.resolve(null);
      pendingInsertRef.current = null;
    }
    setIsMediaModalOpen(false);
  }, []);

  const handleEditorChange = useCallback(() => {
    if (onChange && editor) {
      onChange(editor.document as Block[]);
    }
  }, [editor, onChange]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Box sx={{ ...styles.container, minHeight }}>
        <Box sx={styles.loadingPlaceholder}>Завантаження редактора...</Box>
      </Box>
    );
  }

  return (
    <Box sx={[styles.container, ...sxToArray(sx), { minHeight }]}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleEditorChange}
        theme="light"
        sideMenu={sideMenu}
        slashMenu={false} 
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => {
            const defaultItems = getDefaultReactSlashMenuItems(editor);

            const customImageItem = {
              title: 'Picture',
              aliases: ['image', 'img', 'picture', 'photo', 'фото', 'зображення'],
              group: 'Media',
              icon: <ImageIcon size={18} />,
              subtext: 'Pick photo',
              onItemClick: async () => {
                const finalUrl = await openMediaModal();

                if (finalUrl) {
                  const currentBlock = editor.getTextCursorPosition().block;
                  editor.insertBlocks([{ type: 'image', props: { url: finalUrl } }], currentBlock, 'after');
                }
              }
            };

            const filteredItems = defaultItems.filter(
              (item) => item.title !== 'Image' && item.title !== 'Image (Upload)'
            );

            const mediaGroupIndex = filteredItems.findIndex((item) => item.group === 'Media');

            if (mediaGroupIndex !== -1) {
              filteredItems.splice(mediaGroupIndex, 0, customImageItem);
            } else {
              filteredItems.push(customImageItem);
            }

            return filteredItems.filter((item) => {
              const queryLower = query.toLowerCase();
              const matchesTitle = item.title.toLowerCase().includes(queryLower);
              const matchesAlias = item.aliases?.some((alias: string) => alias.toLowerCase().includes(queryLower));

              return matchesTitle || matchesAlias;
            });
          }}
        />
      </BlockNoteView>

      <MediaModal
        open={isMediaModalOpen}
        onClose={handleCloseMediaModal}
        onApply={handleApplyMediaModal}
        directory="photos" 
      />
    </Box>
  );
};
