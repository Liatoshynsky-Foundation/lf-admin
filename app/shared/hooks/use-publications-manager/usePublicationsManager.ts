import { Block } from '@blocknote/core';
import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_EMPTY_DOCUMENT,
  EditorLanguage,
  LocalizedEditorState,
  PublicationResource,
  PublicationsItemType
} from '~/constants/publications';
import { hasContentChanges } from '~/lib/utils/hasContentChanges';
import { isContentEmpty } from '~/shared/components/content-editor';
import { useDeleteEvent, useEventById, useUpdateEvent } from '~/shared/hooks/use-events/useEvents';
import { useDeleteMediaMention, useMediaMentionById, useUpdateMediaMention } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useDeleteNews, useNewsById, useUpdateNews } from '~/shared/hooks/use-news/useNews';
import { type EventStatus, type MediaStatus, type NewsStatus } from '~/types/graphql/generated/graphql';

export function usePublicationManager(type: PublicationsItemType, id: string) {
  const news = useNewsById(id, { skip: type !== 'news' });
  const event = useEventById(id, { skip: type !== 'events' });
  const media = useMediaMentionById(id, { skip: type !== 'media' });
  const [deleteNews] = useDeleteNews();
  const [deleteEvent] = useDeleteEvent();
  const [deleteMedia] = useDeleteMediaMention();

  const [updateNews] = useUpdateNews();
  const [updateEvent] = useUpdateEvent();
  const [updateMedia] = useUpdateMediaMention();

  const queryMap = useMemo(() => ({ news, events: event, media }), [news, event, media]);
  const activeQuery = queryMap[type];

  const isLoading = activeQuery.loading;
  const hasError = activeQuery.error;

  const currentData = useMemo(() => {
    switch (type) {
    case 'news':
      return news.data?.newsById;
    case 'events':
      return event.data?.eventById;
    case 'media':
      return media.data?.mediaMentionById;
    default:
      return null;
    }
  }, [type, news.data, event.data, media.data]);

  const [editedContent, setEditedContent] = useState<LocalizedEditorState | null>(null);
  const [initialContent, setInitialContent] = useState<LocalizedEditorState | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');
  const [editorResetKey, setEditorResetKey] = useState<number>(0);

  useEffect(() => {
    if (type === 'media' || isLoading || activeQuery.data === undefined) return;

    if (editedContent === null) {
      const resourceData = type === 'news' ? news.data?.newsById?.content : event.data?.eventById?.content;

      const hasUk = !isContentEmpty(resourceData?.uk?.content?.blocks);
      const hasEn = !isContentEmpty(resourceData?.en?.content?.blocks);

      setCurrentLanguage(!hasUk && hasEn ? 'EN' : 'UA');

      const createSafeLangObj = (blocks: Block[] | undefined) => ({
        content: {
          ...DEFAULT_EMPTY_DOCUMENT,
          blocks: !isContentEmpty(blocks) && blocks ? blocks : DEFAULT_EMPTY_DOCUMENT.blocks
        }
      });

      const initialState = {
        uk: createSafeLangObj(resourceData?.uk?.content?.blocks),
        en: createSafeLangObj(resourceData?.en?.content?.blocks)
      };

      setEditedContent(initialState);
      setInitialContent(initialState);
    }
  }, [isLoading, editedContent, type, activeQuery.data, news.data, event.data]);

  const hasUnsavedChanges = useMemo(() => {
    if (!editedContent || !initialContent) return false;

    return hasContentChanges(editedContent, initialContent);
  }, [editedContent, initialContent]);

  const updateResource: PublicationResource = async (status, extra = {}) => {
    switch (type) {
    case 'news':
      return updateNews({
        id,
        input: { ...extra, status: status as unknown as NewsStatus }
      });
    case 'events':
      return updateEvent({
        id,
        input: { ...extra, status: status as unknown as EventStatus }
      });
    case 'media':
      return updateMedia(id, {
        ...extra,
        status: status as unknown as MediaStatus
      });
    default:
      throw new Error(`Unsupported publication type for mutation: ${type}`);
    }
  };

  const resetEditorState = (emptyContent: LocalizedEditorState) => {
    setEditedContent(emptyContent);
    setEditorResetKey((prev) => prev + 1);
  };

  const deleteResource = async () => {
    switch (type) {
    case 'news':
      return deleteNews({ id });
    case 'events':
      return deleteEvent({ id });
    case 'media':
      return deleteMedia(id);
    default:
      throw new Error(`Unsupported publication type for delete: ${type}`);
    }
  };

  return {
    currentData,
    isLoading,
    hasError,

    editedContent,
    setEditedContent,
    hasUnsavedChanges,
    currentLanguage,
    setCurrentLanguage,
    editorResetKey,
    resetEditorState,
    updateResource,
    deleteResource
  };
}
