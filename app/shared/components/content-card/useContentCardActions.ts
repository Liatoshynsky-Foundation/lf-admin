import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import type { ContentType } from './ContentCardMenuItems';
import { CONTENT_MUTATION_RESULTS, MENU_ACTION_CONFIGS } from '~/constants/publications';
import { useDeleteEvent, useUpdateEventStatus } from '~/shared/hooks/use-events/useEvents';
import { useDeleteMediaMention, useUpdateMediaMentionStatus } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useDeleteNews, useUpdateNewsStatus } from '~/shared/hooks/use-news/useNews';
import { EVENTS, NEWS } from '~/src/constants';
import logger from '~/src/middleware/logger/logger';
import { BaseContentStatuses } from '~/types/enums/common.enums';

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

  const runStatusMutation = useCallback(
    async (
      mutate: () => Promise<MutationResult>,
      config: (typeof MENU_ACTION_CONFIGS)[keyof typeof MENU_ACTION_CONFIGS],
      errorLogMessage: string
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
      } catch (error) {
        logger.error(errorLogMessage, error);
        toast.error(toastErrorMessage);
      }
    },
    [router]
  );

  const handleUnpublish = useCallback(async () => {
    await runStatusMutation(
      async () => {
        if (type === NEWS) {
          return unpublishNews(id);
        }

        if (type === EVENTS) {
          return unpublishEvent(id);
        }

        return draftMediaMention(id);
      },
      MENU_ACTION_CONFIGS.CANCEL_PUBLICATION,
      'Error unpublishing:'
    );
  }, [id, type, unpublishNews, unpublishEvent, draftMediaMention, runStatusMutation]);

  const handlePublish = useCallback(async () => {
    await runStatusMutation(
      async () => {
        if (type === NEWS) {
          return publishNews(id);
        }

        if (type === EVENTS) {
          return publishEvent(id);
        }

        return publishMediaMention(id);
      },
      MENU_ACTION_CONFIGS.PUBLISH,
      'Error publishing:'
    );
  }, [id, type, publishNews, publishEvent, publishMediaMention, runStatusMutation]);

  const handleDelete = useCallback(async () => {
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
        router.refresh();
      }
    } catch (error) {
      logger.error('Error deleting:', error);
      toast.error(CONTENT_MUTATION_RESULTS.publicationDeleteError);
    }
  }, [id, type, deleteNews, deleteEvent, deleteMediaMention, router]);

  return {
    deleteModalOpen,
    setDeleteModalOpen,
    handleDelete,
    handlePublish,
    handleUnpublish,
    isPublished: status === BaseContentStatuses.Published
  };
}
