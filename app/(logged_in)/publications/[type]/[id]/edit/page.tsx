'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import CreatePublicationsView from '../../create/CreatePublicationsView';
import { EditPublicationsView } from './EditPublicationsView';
import {
  CONTENT_MUTATION_RESULTS,
  MENU_ACTION_CONFIGS,
  MenuActionId,
  PUBLICATIONS_BASE_PATH,
  PublicationsItemType
} from '~/constants/publications';
import { fetchPreview } from '~/lib/utils/fetchPreview';
import { getPreviewSlug } from '~/lib/utils/getPreviewSlug';
import { SerializedContent } from '~/shared/components/content-editor';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { usePublicationManager } from '~/shared/hooks/use-publications-manager/usePublicationsManager';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';
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

  useUnsavedChanges(manager.hasUnsavedChanges);

  const publicationData = useUpsertPublication({ type, id });

  const latestBlocksRef = useRef<SerializedContent | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { navigate, navigateBack } = useNavigationGuard();

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
        manager.setEditedContent((prev) => {
          const next = prev ? { ...prev, [localeKey]: { content: latestBlocksRef.current! } } : prev;
          return next;
        });
      }
    }, 500);
  };

  const handlePreview = async () => {
    const locale = manager.currentLanguage === 'UA' ? 'uk' : 'en';
    const slug = manager.currentData?.slug;

    if (!slug) {
      toast.error('Виникла помилка при отриманні даних для попереднього перегляду');
      console.error('Не вдалося завантажити slug для попереднього перегляду');
      return;
    }

    try {
      const currentStatus = (manager.currentData?.status ?? BaseContentStatuses.Draft) as BaseContentStatuses;

      const result = await publicationData.handleSave(currentStatus);

      if (!result?.id || !result?.slug) {
        toast.error('Виникла помилка підчас публікації для попереднього перегляду');
        return;
      }

      await manager.updateResource(
        currentStatus,
        type === 'media' ? {} : { content: manager.editedContent }
      );

      const previewSlug = getPreviewSlug({ publicationType: type, dbSlug: result.slug });
      await fetchPreview({ slug: previewSlug, lang: locale, draftId: id });
    } catch (err) {
      toast.error(`Помилка: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const performUpdateAction = async (actionId: keyof typeof MENU_ACTION_CONFIGS) => {
    const { status, toastMessage, toastErrorMessage } = MENU_ACTION_CONFIGS[actionId];
    const { data } = await manager.updateResource(status, { content: manager.editedContent });
    return { data, toastMessage, toastErrorMessage };
  };

  const performDeleteAction = async () => {
    const { data } = await manager.deleteResource();
    return {
      data,
      toastMessage: CONTENT_MUTATION_RESULTS.publicationDeleted,
      toastErrorMessage: 'Виникла помилка при видаленні публікації. Спробуйте ще раз.',
    };
  };

  const NAVIGATE_AFTER_ACTIONS = new Set<MenuActionId>([
    MenuActionId.PUBLICATE_AND_EXIT,
    MenuActionId.DELETE,
    MenuActionId.CANCEL_PUBLICATION,
  ]);

  const handleMenuAction = async (actionId: MenuActionId) => {
    try {
      const { data, toastErrorMessage, toastMessage } = actionId === MenuActionId.DELETE ? await performDeleteAction() : await performUpdateAction(actionId);

      if (!data) {
        toast.error(toastErrorMessage);
        return;
      }

      toast.success(toastMessage);
      
      if (NAVIGATE_AFTER_ACTIONS.has(actionId)) {
        router.push(PUBLICATIONS_BASE_PATH);
      }
    } catch (err) {
      toast.error(`Помилка: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`Action ${actionId} failed`, err);
    }
  };

  return (
    <>
      {type === 'media' ? (
        <CreatePublicationsView data={publicationData} mode="edit" onPreview={handlePreview} />
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
          onDeleteConfirm={() => handleMenuAction(MenuActionId.DELETE)}
          onSeoClick={() => navigate(`${PUBLICATIONS_BASE_PATH}/${type}/${id}/seo`)}
          onBackClick={navigateBack}
          onPreview={handlePreview}
        />
      )}
    </>
  );
}
