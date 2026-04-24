import dayjs, { type Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FetchedPublicationData, ImageCropData, initialSeoValue, PAGE_TITLES, PUBLICATIONS_BASE_PATH, PUBLICATIONS_TYPES, PublicationsItemType } from '~/constants/publications';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useCreateEvent, useEventById, useUpdateEvent } from '~/shared/hooks/use-events/useEvents';
import {
  useCreateMediaMention,
  useMediaMentionById,
  useUpdateMediaMention
} from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useCreateNews, useNewsById, useUpdateNews } from '~/shared/hooks/use-news/useNews';
import { EventStatus, MediaStatus, NewsStatus } from '~/types/graphql/generated/graphql';


const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const checkIsSeoInvalid = (
  ukMeta: SeoBlockValue['meta']['uk'],
  enMeta: SeoBlockValue['meta']['en'],
  publicationType: PublicationsItemType,
  ticketUrl: SeoBlockValue['ticketUrl']
): boolean => {
  if (!ukMeta.title.trim() || !enMeta.title.trim()) return true;
  if (!ukMeta.description.trim() || !enMeta.description.trim()) return true;

  if (publicationType === 'media') {
    const ukUrl = ukMeta.canonicalUrl ?? '';
    const enUrl = enMeta.canonicalUrl ?? '';
    return !ukUrl.trim() || !enUrl.trim() || !isValidUrl(ukUrl) || !isValidUrl(enUrl);
  }
  if (publicationType === 'events') {
    const ukUrl = ticketUrl?.uk ?? '';
    const enUrl = ticketUrl?.en ?? '';
    return !ukUrl.trim() || !enUrl.trim() || !isValidUrl(ukUrl) || !isValidUrl(enUrl);
  }
  return false;
};

interface UseUpsertPublicationProps {
  type: PublicationsItemType;
  id?: string;
}

export const useUpsertPublication = ({ type, id }: UseUpsertPublicationProps) => {
  const router = useRouter();
  const isEditing = Boolean(id);

  const isValidType = PUBLICATIONS_TYPES.includes(type as PublicationsItemType);
  const publicationType = type as PublicationsItemType;
  const pageTitle = isValidType ? `${isEditing ? 'Редагування' : 'Створення'} ${PAGE_TITLES[publicationType]}` : '';

  const newsQuery = useNewsById(id as string, { skip: type !== 'news' || !isEditing });
  const eventQuery = useEventById(id as string, { skip: type !== 'events' || !isEditing });
  const mediaQuery = useMediaMentionById(id as string, { skip: type !== 'media' || !isEditing });

  const [createNews] = useCreateNews();
  const [createEvent] = useCreateEvent();
  const [createMediaMention] = useCreateMediaMention();

  const [updateEvent] = useUpdateEvent();
  const [updateNews] = useUpdateNews();
  const [updateMediaMention] = useUpdateMediaMention();

  const [adminTitle, setAdminTitleState] = useState('');
  const [adminTitleError, setAdminTitleError] = useState('');
  const [publishDate, setPublishDateState] = useState<Dayjs | null>(null);
  const [seoValue, setSeoValueState] = useState<SeoBlockValue>(initialSeoValue);

  const [crop, setCropState] = useState<ImageCropData>(null);
  const [forceShowErrors, setForceShowErrors] = useState(false);

  const latestDataRef = useRef({
    adminTitle: '',
    publishDate: null as Dayjs | null,
    seoValue: initialSeoValue,
    crop: null as ImageCropData | null
  });

  const isInitializedRef = useRef(false);

  const setAdminTitle = (val: string) => {
    latestDataRef.current.adminTitle = val;
    setAdminTitleState(val);
  };
  const setPublishDate = (val: Dayjs | null) => {
    latestDataRef.current.publishDate = val;
    setPublishDateState(val);
  };
  const setSeoValue = (val: SeoBlockValue | ((prev: SeoBlockValue) => SeoBlockValue)) => {
    const newValue = typeof val === 'function' ? val(latestDataRef.current.seoValue) : val;
    latestDataRef.current.seoValue = newValue;
    setSeoValueState(newValue);
  };

  const setCrop = (val: ImageCropData) => {
    latestDataRef.current.crop = val;
    setCropState(val);
  };

  useEffect(() => {
    if (!isEditing || isInitializedRef.current) return;

    let fetchedData: FetchedPublicationData | null = null;

    if (type === 'news' && newsQuery.data?.newsById) {
      fetchedData = newsQuery.data.newsById as FetchedPublicationData;
    } else if (type === 'events' && eventQuery.data?.eventById) {
      fetchedData = eventQuery.data.eventById as FetchedPublicationData;
    } else if (type === 'media' && mediaQuery.data?.mediaMentionById) {
      fetchedData = mediaQuery.data.mediaMentionById as FetchedPublicationData;
    }

    if (fetchedData) {
      setAdminTitle(fetchedData.adminTitle || '');

      const safeParseDate = (dateVal: Dayjs | string | null | undefined) => {
        if (!dateVal) return null;
        const num = Number(dateVal);
        return dayjs(!isNaN(num) ? num : dateVal);
      };

      const mainDate = type === 'news' ? fetchedData.newsDate : fetchedData.publishedAt;
      setPublishDate(safeParseDate(mainDate));

      setCrop(fetchedData.coverImage?.crop ?? null);

      const getLangMeta = (lang: 'uk' | 'en') => {
        const start = safeParseDate(fetchedData?.eventDateTimeStart);
        const end = safeParseDate(fetchedData?.eventDateTimeEnd);

        return {
          title: fetchedData?.title?.[lang] || '',
          description: fetchedData?.description?.[lang] || '',
          keywords: fetchedData?.keywords?.[lang] || '',

          canonicalUrl: type === 'media' ? fetchedData?.url || '' : '',
          altText: {
            uk: fetchedData?.coverImage?.alt?.uk || '',
            en: fetchedData?.coverImage?.alt?.en || ''
          },
          startDateTime: start ? start.toISOString() : undefined,
          endDateTime: end ? end.toISOString() : undefined
        };
      };

      setSeoValue({
        meta: { uk: getLangMeta('uk'), en: getLangMeta('en') },
        ogImage: fetchedData.coverImage?.src || null,
        allowIndexing: {
          uk: fetchedData.allowIndexation?.uk ?? true,
          en: fetchedData.allowIndexation?.en ?? true
        },
        ticketUrl: {
          uk: fetchedData.ticketUrl?.uk || '',
          en: fetchedData.ticketUrl?.en || ''
        }
      });

      isInitializedRef.current = true;
    }
  }, [isEditing, type, newsQuery.data, eventQuery.data, mediaQuery.data]);

  const handleSave = async () => {
    if (!isValidType) return;

    const currentAdminTitle = latestDataRef.current.adminTitle;
    const currentSeoValue = latestDataRef.current.seoValue;
    const currentPublishDate = latestDataRef.current.publishDate;

    const currentCrop = latestDataRef.current.crop;

    const ukMeta = currentSeoValue.meta.uk;
    const enMeta = currentSeoValue.meta.en;

    const isAdminTitleInvalid = !currentAdminTitle.trim();
    const isSeoInvalid = checkIsSeoInvalid(ukMeta, enMeta, publicationType, currentSeoValue.ticketUrl);

    if (isAdminTitleInvalid) setAdminTitleError('Обов\'язкове поле');
    if (isSeoInvalid) setForceShowErrors(true);
    if (isAdminTitleInvalid || isSeoInvalid) return;

    const coverImage = {
      src: currentSeoValue.ogImage ?? currentAdminTitle,
      alt: {
        uk: ukMeta.altText?.uk || currentAdminTitle,
        en: enMeta.altText?.en || currentAdminTitle
      },
      caption: { uk: currentAdminTitle, en: currentAdminTitle },

      ...(currentCrop ? { crop: currentCrop } : {})
    };

    const commonInput = {
      adminTitle: currentAdminTitle,
      title: { uk: ukMeta.title || currentAdminTitle, en: enMeta.title || currentAdminTitle },
      description: { uk: ukMeta.description || '', en: enMeta.description || '' },
      keywords: { uk: ukMeta.keywords || '', en: enMeta.keywords || '' },
      allowIndexation: { uk: currentSeoValue.allowIndexing.uk, en: currentSeoValue.allowIndexing.en },
      coverImage,
      publishedAt: currentPublishDate?.toISOString() ?? undefined
    };

    try {
      if (publicationType === 'events') {
        const payload = {
          ...commonInput,
          eventLink: currentAdminTitle,
          eventDateTimeStart: ukMeta.startDateTime ?? undefined,
          eventDateTimeEnd: ukMeta.endDateTime ?? undefined,
          ticketUrl: currentSeoValue.ticketUrl ?? undefined
        };

        if (isEditing && id) {
          await updateEvent({ id, input: payload });
          router.push(`${PUBLICATIONS_BASE_PATH}/events/${id}/edit`);
        } else {
          const result = await createEvent({
            ...payload,
            content: { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } },
            status: EventStatus.Draft
          });
          if (result.data?.createEvent.id)
            router.push(`${PUBLICATIONS_BASE_PATH}/events/${result.data.createEvent.id}/edit`);
        }
      } else if (publicationType === 'news') {
        const payload = {
          ...commonInput,
          newsDate: currentPublishDate?.toISOString() ?? undefined
        };

        if (isEditing && id) {
          await updateNews({ id, input: payload });
          router.push(`${PUBLICATIONS_BASE_PATH}/news/${id}/edit`);
        } else {
          const result = await createNews({
            ...payload,
            content: { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } },
            status: NewsStatus.Draft
          });
          if (result.data?.createNews.id)
            router.push(`${PUBLICATIONS_BASE_PATH}/news/${result.data.createNews.id}/edit`);
        }
      } else if (publicationType === 'media') {
        const payload = {
          ...commonInput,
          url: ukMeta.canonicalUrl || enMeta.canonicalUrl || currentAdminTitle
        };

        if (isEditing && id) {
          await updateMediaMention(id, payload);
          router.push(PUBLICATIONS_BASE_PATH);
        } else {
          const result = await createMediaMention({
            ...payload,
            status: MediaStatus.Draft
          });
          if (result.data?.createMediaMention.id) router.push(PUBLICATIONS_BASE_PATH);
        }
      }
    } catch {
      // errors are handled by safeMutate
    }
  };

  const handleDateTimeChange = useCallback((start: string | undefined, end: string | undefined) => {
    setSeoValue((prev) => ({
      ...prev,
      meta: {
        uk: { ...prev.meta.uk, startDateTime: start, endDateTime: end },
        en: { ...prev.meta.en, startDateTime: start, endDateTime: end }
      }
    }));
  }, []);

  return {
    isEditing,
    isLoading: isEditing && (newsQuery.loading || eventQuery.loading || mediaQuery.loading),
    isValidType,
    publicationType,
    pageTitle,
    adminTitle,
    setAdminTitle,
    adminTitleError,
    setAdminTitleError,
    publishDate,
    setPublishDate,
    seoValue,
    setSeoValue,

    crop,
    setCrop,

    forceShowErrors,
    handleSave,
    handleDateTimeChange
  };
};
