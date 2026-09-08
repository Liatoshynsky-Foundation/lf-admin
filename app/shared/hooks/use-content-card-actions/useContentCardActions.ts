'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { CONTENT_MUTATION_RESULTS, MENU_ACTION_CONFIGS } from '~/constants/publications';
import { useDeleteEvent, useUpdateEventStatus } from '~/shared/hooks/use-events/useEvents';
import { useDeleteMediaMention, useUpdateMediaMentionStatus } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useDeleteNews, useUpdateNewsStatus } from '~/shared/hooks/use-news/useNews';
import { EVENTS, NEWS } from '~/src/constants';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type ContentType = 'news' | 'events' | 'media';

interface UseContentCardActionsParams {
  id: string;
  type: ContentType;
  status: string;
}

type MutationResult = { data?: unknown };

export function useContentCardActions({ id, type, status }: UseContentCardActionsParams) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deleteNews] = useDeleteNews();
  const [deleteEvent] = useDeleteEvent();
  const [deleteMediaMention] = useDeleteMediaMention();
  const [{ unpublish: unpublishNews, publish: publishNews }] = useUpdateNewsStatus();
  const [{ unpublish: unpublishEvent, publish: publishEvent }] = useUpdateEventStatus();
  const [{ draft: draftMediaMention, publish: publishMediaMention }] = useUpdateMediaMentionStatus();

  const runStatusMutation = async (
    mutate: () => Promise<MutationResult>,
    config: (typeof MENU_ACTION_CONFIGS)[keyof typeof MENU_ACTION_CONFIGS]
  ) => {
    const { toastMessage, toastErrorMessage } = config;

    try {
      const result = await mutate();

      if (result?.data) {
        toast.success(toastMessage);
        router.refresh();
      } else {
        toast.error(toastErrorMessage);
      }
    } catch {
      toast.error(toastErrorMessage);
    }
  };

  const handleUnpublish = async () => {
    await runStatusMutation(async () => {
      if (type === NEWS) {
        return unpublishNews(id);
      }

      if (type === EVENTS) {
        return unpublishEvent(id);
      }

      return draftMediaMention(id);
    }, MENU_ACTION_CONFIGS.CANCEL_PUBLICATION);
  };

  const handlePublish = async () => {
    await runStatusMutation(async () => {
      if (type === NEWS) {
        return publishNews(id);
      }

      if (type === EVENTS) {
        return publishEvent(id);
      }

      return publishMediaMention(id);
    }, MENU_ACTION_CONFIGS.PUBLISH);
  };

  const handleDelete = async () => {
    try {
      let result: MutationResult | undefined;

      if (type === NEWS) {
        result = await deleteNews({ id });
      } else if (type === EVENTS) {
        result = await deleteEvent({ id });
      } else {
        result = await deleteMediaMention(id);
      }

      if (result?.data) {
        setDeleteModalOpen(false);
      }
    } catch {
      toast.error(CONTENT_MUTATION_RESULTS.publicationDeleteError);
    }
  };

  return {
    deleteModalOpen,
    setDeleteModalOpen,
    handleDelete,
    handlePublish,
    handleUnpublish,
    isPublished: status === BaseContentStatuses.Published
  };
}
