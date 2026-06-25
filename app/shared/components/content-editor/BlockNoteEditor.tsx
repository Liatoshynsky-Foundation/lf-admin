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
import { FormattingToolbarController, SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './BlockNoteEditor.styles';
import { CroppedImageBlock } from './cropped-image-block/CroppedImageBlock';
import { CustomFormattingToolbar } from './custom-formatting-toolbar/CustomFormattingToolbar';
import { BlockNoteEditorProps } from './types';
import { getCustomSlashMenuItems } from '~/lib/utils/getCustomSlashMenuItems';
import { sxToArray } from '~/lib/utils/sxToArray';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

const MAX_CHARS_LIMIT = 5000;
const MAX_CHARS_EXCEEDED_MSG = `Вміст не повинен перевищувати ${MAX_CHARS_LIMIT} символів.`;

type TiptapInternal = {
  _tiptapEditor?: {
    state?: {
      doc?: {
        textContent?: string;
      };
    };
    editorState?: {
      doc?: {
        textContent?: string;
      };
    };
    commands: {
      undo: () => void;
    };
  };
};


const DEFAULT_EDITOR_SETTINGS = {
  placeholder: 'Почніть вводити текст або використайте "/" для команд...',
  editable: true,
  sideMenu: false,
  minHeight: '800px'
} as const;

const defaultFileUploadHandler = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const customSchema = BlockNoteSchema.create(
  {
    blockSpecs: {
      ...defaultBlockSpecs,
      image: CroppedImageBlock()
    },
    inlineContentSpecs: defaultInlineContentSpecs,
    styleSpecs: defaultStyleSpecs
  }
);

const RESTRICTED_SYMBOLS_REGEX = /[\p{Extended_Pictographic}\p{So}]/gu;
const getCleanedText = (input: string) => {
  if (RESTRICTED_SYMBOLS_REGEX.test(input)) {
    toast.error('Використання емодзі та спецсимволів не дозволено');
    return input
      .replace(RESTRICTED_SYMBOLS_REGEX, '')
      .replace(/[ \t]{2,}/g, ' ');
  }
  return input;
};


const processHTML = (html: string) => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('style');
    el.removeAttribute('class');
  });

  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null = null;

  while ((node = walker.nextNode())) {
    if (node.nodeValue !== null) {
      node.nodeValue = getCleanedText(node.nodeValue);
    }
  }

  return doc.body.innerHTML;
};



const getDocTextContent = (editorInstance: unknown): string => {
  const internal = editorInstance as TiptapInternal;
  const tiptap = internal?._tiptapEditor;
  if (!tiptap) return '';
  const docState = tiptap.state || tiptap.editorState;

  const textContent = docState?.doc?.textContent || '';

  return textContent;
};

const getCharCount = (editorInstance: unknown) => {
  const textContent = getDocTextContent(editorInstance);
  return textContent.length;
};


export const BlockNoteEditor = (props: BlockNoteEditorProps) => {
  const {
    initialContent,
    onChange,
    fileUpload,
    sx,
    placeholder = DEFAULT_EDITOR_SETTINGS.placeholder,
    editable = DEFAULT_EDITOR_SETTINGS.editable,
    sideMenu = DEFAULT_EDITOR_SETTINGS.sideMenu,
    minHeight = DEFAULT_EDITOR_SETTINGS.minHeight
  } = props;

  const [isMounted, setIsMounted] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const pendingInsertRef = useRef<{ resolve: (url: MediaModalResult | null) => void } | null>(null);

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

  const editor = useCreateBlockNote(
    {
      schema: customSchema,
      uploadFile: handleSilentFileUpload,
      initialContent: initialContent || undefined,
      placeholders: { default: placeholder },
      pasteHandler({ event, editor: editorInstance, defaultPasteHandler }) {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return defaultPasteHandler();

        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');
        if (html) {
          const cleanedHTML = processHTML(html);
          const blocks = editorInstance.tryParseHTMLToBlocks(cleanedHTML);

          blocks.forEach((block) => {
            if (Array.isArray(block.content)) {
              editorInstance.insertInlineContent(block.content);
            }
          });
        } else if (text) {
          const cleanedText = getCleanedText(text).trim();
          editorInstance.insertInlineContent(cleanedText);
        }
        return true;
      },
    },
    [isMounted]
  );

  const openMediaModal = useCallback((): Promise<MediaModalResult | null> => {
    return new Promise((resolve) => {
      pendingInsertRef.current = { resolve };
      setIsMediaModalOpen(true);
    });
  }, []);

  const handleApplyMediaModal = useCallback((result: MediaModalResult) => {
    if (pendingInsertRef.current) {
      pendingInsertRef.current.resolve(result);
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
    if (editor) {
      const charCount = getCharCount(editor);

      if (charCount > MAX_CHARS_LIMIT) {
        toast.error(MAX_CHARS_EXCEEDED_MSG);

        editor.undo();

        return;
      }

      if (onChange) {
        onChange(editor.document as Block[]);
      }
    }
  }, [editor, onChange]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderFormattingToolbar = useCallback(
    () => (
      <CustomFormattingToolbar openMediaModal={openMediaModal} />
    ),
    [openMediaModal]
  );

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
        formattingToolbar={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => getCustomSlashMenuItems(editor, query, openMediaModal)}
        />
        <FormattingToolbarController
          formattingToolbar={renderFormattingToolbar}
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
