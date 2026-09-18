import { DocumentNode } from '@apollo/client';

import type { PublicationFormState } from './usePublicationForm';
import { FetchedPublicationData, PublicationsItemType } from '~/constants/publications';
import {
  useCreateEvent,
  useEventById,
  useUpdateEvent
} from '~/shared/hooks/use-events/useEvents';
import {
  useCreateMediaMention,
  useMediaMentionById,
  useUpdateMediaMention
} from '~/shared/hooks/use-media-mentions/useMediaMentions';
import {
  useCreateNews,
  useNewsById,
  useUpdateNews
} from '~/shared/hooks/use-news/useNews';
import { PreviewDocument } from '~/shared/hooks/use-system-preview/useSystemPreview';
import { LocalizedBoolean,LocalizedString } from '~/types/common';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  AllEventsDocument,
  AllNewsDocument,
  EventStatus,
  MediaStatus,
  NewsStatus
} from '~/types/graphql/generated/graphql';

export type BasePayload = {
  adminTitle: string;
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedString;
  allowIndexation: LocalizedBoolean;
  publishedAt?: string;
  coverImage: Record<string, unknown>;
  slug?: string;
};

export interface PublicationStrategy {
  data: FetchedPublicationData | null;
  loading: boolean;
  saveDocument: (status: BaseContentStatuses, payload: BasePayload, formState: PublicationFormState, targetId?: string) => Promise<{ id: string | undefined; slug: string | undefined }>;
  previewConfig: {
    slug: string;
    query: DocumentNode;
    itemsAccessor: (data: Record<string, unknown>) => PreviewDocument[] | undefined | null;
  } | null;
  extractDate: (data: FetchedPublicationData) => string | null | undefined;
}

const emptyContent = { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } };

export const useNewsStrategy = (id?: string, skip = false): PublicationStrategy => {
  const query = useNewsById(id as string, { skip: skip || !id });
  const [createNews] = useCreateNews();
  const [updateNews] = useUpdateNews();

  const saveDocument = async (status: BaseContentStatuses, payload: BasePayload, formState: PublicationFormState, targetId?: string) => {
    const fullPayload = {
      ...payload,
      newsDate: payload.publishedAt,
      status: status as string as NewsStatus,
      ...(payload.slug ? { slug: payload.slug } : {})
    };
    if (targetId) {
      const data = await updateNews({ id: targetId, input: fullPayload });
      return { id: data.data?.updateNews.id, slug: data.data?.updateNews.slug };
    }
    const r = await createNews({ ...fullPayload, content: emptyContent });
    return { id: r.data?.createNews?.id, slug: r.data?.createNews?.slug };
  };

  return {
    data: (query.data?.newsById as FetchedPublicationData | undefined) ?? null,
    loading: query.loading,
    saveDocument,
    previewConfig: {
      slug: 'sys-preview-news',
      query: AllNewsDocument,
      itemsAccessor: (data: { allNews?: PreviewDocument[] }) => data?.allNews
    },
    extractDate: (data) => data.newsDate
  };
};

export const useEventStrategy = (id?: string, skip = false): PublicationStrategy => {
  const query = useEventById(id as string, { skip: skip || !id });
  const [createEvent] = useCreateEvent();
  const [updateEvent] = useUpdateEvent();

  const saveDocument = async (status: BaseContentStatuses, payload: BasePayload, formState: PublicationFormState, targetId?: string) => {
    const { uk: ukMeta } = formState.seoValue.meta;
    const fullPayload = {
      ...payload,
      eventLink: payload.adminTitle,
      eventDateTimeStart: ukMeta.startDateTime || '',
      eventDateTimeEnd: ukMeta.endDateTime || '',
      ticketUrl: formState.seoValue.ticketUrl,
      status: status as string as EventStatus,
      ...(payload.slug ? { slug: payload.slug } : {})
    };
    if (targetId) {
      const data = await updateEvent({ id: targetId, input: fullPayload });
      return { id: data.data?.updateEvent.id, slug: data.data?.updateEvent.slug };
    }
    const r = await createEvent({ ...fullPayload, content: emptyContent });
    return { id: r.data?.createEvent?.id, slug: r.data?.createEvent?.slug };
  };

  return {
    data: (query.data?.eventById as FetchedPublicationData | undefined) ?? null,
    loading: query.loading,
    saveDocument,
    previewConfig: {
      slug: 'sys-preview-events',
      query: AllEventsDocument,
      itemsAccessor: (data: { allEvents?: PreviewDocument[] }) => data?.allEvents
    },
    extractDate: (data) => data.publishedAt
  };
};

export const useMediaStrategy = (id?: string, skip = false): PublicationStrategy => {
  const query = useMediaMentionById(id as string, { skip: skip || !id });
  const [createMediaMention] = useCreateMediaMention();
  const [updateMediaMention] = useUpdateMediaMention();

  const saveDocument = async (status: BaseContentStatuses, payload: BasePayload, formState: PublicationFormState, targetId?: string) => {
    const { uk: ukMeta, en: enMeta } = formState.seoValue.meta;
    const fullPayload = {
      ...payload,
      url: ukMeta.canonicalUrl || enMeta.canonicalUrl || formState.adminTitle,
      status: status as string as MediaStatus,
      ...(payload.slug ? { slug: payload.slug } : {})
    };
    if (targetId) {
      const response = await updateMediaMention(targetId, fullPayload);
      return { id: response.data?.updateMediaMention?.id, slug: response.data?.updateMediaMention?.slug };
    } else {
      const response = await createMediaMention(fullPayload);
      return { id: response.data?.createMediaMention?.id, slug: response.data?.createMediaMention?.slug };
    }
  };

  return {
    data: (query.data?.mediaMentionById as FetchedPublicationData | undefined) ?? null,
    loading: query.loading,
    saveDocument,
    previewConfig: null,
    extractDate: (data) => data.publishedAt
  };
};

export const usePublicationStrategy = (type: PublicationsItemType, id?: string): PublicationStrategy => {
  const newsStrategy = useNewsStrategy(id, type !== 'news');
  const eventStrategy = useEventStrategy(id, type !== 'events');
  const mediaStrategy = useMediaStrategy(id, type !== 'media');

  switch (type) {
  case 'news':
    return newsStrategy;
  case 'events':
    return eventStrategy;
  case 'media':
    return mediaStrategy;
  default:
    throw new Error(`Unsupported publication type: ${type}`);
  }
};
