'use client';

import { Block } from '@blocknote/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { BlockNoteEditor } from './BlockNoteEditor';
import { deserializeContent, isContentEqual, serializeContent } from './contentSerializer';
import { ContentEditorProps } from './types';

export const ContentEditor = ({
  initialContent,
  persistence,
  editorConfig,
  renderSaveButton,
  onSaveComplete,
  sx
}: ContentEditorProps) => {
  const [content, setContent] = useState<Block[] | null>(() => deserializeContent(initialContent));

  const [lastSavedContent, setLastSavedContent] = useState<Block[] | null>(() => deserializeContent(initialContent));

  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hasUnsavedChanges = !isContentEqual(content, lastSavedContent);

  const handleSave = useCallback(async () => {
    if (!content || !persistence?.onSave) {
      return;
    }

    setIsSaving(true);

    try {
      const serialized = serializeContent(content);
      const success = await persistence.onSave(serialized);

      if (success) {
        setLastSavedContent(content);
        onSaveComplete?.(true);
      } else {
        onSaveComplete?.(false);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  }, [content, persistence, onSaveComplete]);

  const handleContentChange = useCallback(
    (newContent: Block[]) => {
      setContent(newContent);

      if (persistence?.onChange) {
        const serialized = serializeContent(newContent);
        persistence.onChange(serialized);
      }
    },
    [persistence]
  );

  useEffect(() => {
    if (!persistence?.autoSaveInterval || !hasUnsavedChanges) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, persistence.autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [persistence?.autoSaveInterval, hasUnsavedChanges, handleSave]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <BlockNoteEditor
        initialContent={content}
        onChange={handleContentChange}
        placeholder={editorConfig?.placeholder}
        editable={editorConfig?.editable}
        sideMenu={editorConfig?.sideMenu}
        minHeight={editorConfig?.minHeight}
        fileUpload={editorConfig?.fileUpload}
        keyboardShortcuts={{
          onSave: () => void handleSave()
        }}
        sx={sx}
      />

      {renderSaveButton?.({ onSave: () => void handleSave(), isSaving })}
    </>
  );
};
