'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import CreatePublicationsView from '../../create/CreatePublicationsView';
import { EditPublicationsView } from './EditPublicationsView';
import { publicationErrors } from '~/constants/errors';
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

  const [isSaving, setIsSaving] = useState(false);

  const { navigate, navigateBack } = useNavigationGuard();

  if (!manager.isLoading && manager.currentData === null && !manager.hasError) {
    notFound();
  }

  const handleEditorChange = (content: SerializedContent, localeKey: 'uk' | 'en') => {
    manager.setEditedContent((prev) => (prev ? { ...prev, [localeKey]: { content } } : prev));
  };

  const handlePreview = async () => {
    const locale = manager.currentLanguage === 'UA' ? 'uk' : 'en';

    try {
      if (type === 'events' || type === 'news') {
        const result = await publicationData.handlePreviewSave(locale);

        if (!result?.id || !result?.slug) {
          return;
        }

        await manager.updatePreviewResource(
          result.id,
          BaseContentStatuses.Draft,
          { content: manager.editedContent }
        );

        const previewSlug = getPreviewSlug({ publicationType: type, dbSlug: result.slug });
        await fetchPreview({ slug: previewSlug, lang: locale, draftId: result.id });
        return;
      }

      const slug = manager.currentData?.slug;

      if (!slug) {
        toast.error(publicationErrors[locale].previewSlugFailed);
        return;
      }

      const currentStatus = (manager.currentData?.status ?? BaseContentStatuses.Draft) as BaseContentStatuses;

      const result = await publicationData.handleSave(currentStatus, locale);

      if (!result?.id || !result?.slug) {
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

  const handleSave = async () => {
    const content = manager.editedContent;
    if (isSaving || !content) return;

    setIsSaving(true);
    const errorMessage = 'Не вдалося зберегти зміни. Спробуйте ще раз.';

    try {
      const { data } = await manager.updateResource(undefined, { content });
      if (!data) {
        toast.error(errorMessage);
        return;
      }

      manager.markContentSaved(content);
      toast.success('Зміни збережено.');
    } catch {
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
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
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
