'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import CreatePublicationsView from '../../create/CreatePublicationsView';
import { EditPublicationsView } from './EditPublicationsView';
import {
  CONTENT_MUTATION_RESULTS,
  DEFAULT_EMPTY_DOCUMENT,
  MenuActionId,
  PUBLICATIONS_BASE_PATH,
  PublicationsItemType
} from '~/constants/publications';
import { SerializedContent } from '~/shared/components/content-editor';
import { usePublicationManager } from '~/shared/hooks/use-publications-manager/usePublicationsManager';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type Params = {
  type: PublicationsItemType;
  id: string;
};

export default function EditPublicationsPage() {
  const { type, id } = useParams<Params>();
  const router = useRouter();

  const manager = usePublicationManager(type, id);
  const publicationData = useUpsertPublication({ type, id });

  const latestBlocksRef = useRef<SerializedContent | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!manager.isLoading && manager.currentData === null && !manager.hasError) {
    notFound();
  }

  const handleEditorChange = (content: SerializedContent, localeKey: 'uk' | 'en') => {
    latestBlocksRef.current = content;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      if (latestBlocksRef.current) {
        manager.setEditedContent((prev) =>
          prev ? { ...prev, [localeKey]: { content: latestBlocksRef.current! } } : prev
        );
      }
    }, 500);
  };

  const handleMenuAction = async (actionId: MenuActionId) => {
    const contentPayload = { content: manager.editedContent };

    try {
      switch (actionId) {
      case MenuActionId.PUBLISH: {
        const { data } = await manager.updateResource(BaseContentStatuses.Published, contentPayload);
        if (data) toast.success(CONTENT_MUTATION_RESULTS.draftPublished);
        break;
      }

      case MenuActionId.SAVE_DRAFT: {
        const { data } = await manager.updateResource(BaseContentStatuses.Draft, contentPayload);
        if (data) toast.success(CONTENT_MUTATION_RESULTS.draftSaved);
        break;
      }

      case MenuActionId.SAVE_AND_EXIT: {
        const { data } = await manager.updateResource(BaseContentStatuses.Draft, contentPayload);
        if (data) {
          toast.success(CONTENT_MUTATION_RESULTS.draftSaved);
          router.push(PUBLICATIONS_BASE_PATH);
        }
        break;
      }

      case MenuActionId.DELETE_DRAFT: {
        const localeKey = manager.currentLanguage === 'UA' ? 'uk' : 'en';

        const emptyContent = {
          content: {
            ...manager.editedContent,
            [localeKey]: { content: { ...DEFAULT_EMPTY_DOCUMENT } }
          }
        };

        const currentStatus =
            (manager.currentData?.status as unknown as BaseContentStatuses) ?? BaseContentStatuses.Draft;

        const { data } = await manager.updateResource(currentStatus, emptyContent);

        if (data) {
          toast.success(CONTENT_MUTATION_RESULTS.draftDeleted);
          latestBlocksRef.current = null;
          manager.resetEditorState(emptyContent.content);
        }
        break;
      }
      }
    } catch (err) {
      toast.error(`Помилка: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`Action ${actionId} failed`, err);
    }
  };

  return type === 'media' ? (
    <CreatePublicationsView data={publicationData}  mode='edit'/>
  ) : (
    <EditPublicationsView
      type={type}
      isLoading={manager.isLoading}
      currentData={manager.currentData}
      editedContent={manager.editedContent}
      editorResetKey={manager.editorResetKey}
      currentLanguage={manager.currentLanguage}
      onLanguageChange={manager.setCurrentLanguage}
      onEditorChange={handleEditorChange}
      onAction={handleMenuAction}
      onSeoClick={() => router.push(`${PUBLICATIONS_BASE_PATH}/${type}/${id}/seo`)}
    />
  );
}
