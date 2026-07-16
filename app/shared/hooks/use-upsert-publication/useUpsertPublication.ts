import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  FetchedPublicationData,
  ImageCropData,
  initialSeoValue,
  PAGE_TITLES,
  PUBLICATIONS_TYPES,
  PublicationsItemType
} from '~/constants/publications';
import { buildCoverImageCropPayload } from '~/lib/utils/CropperHelper';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useCreateEvent, useEventById, useUpdateEvent } from '~/shared/hooks/use-events/useEvents';
import {
  useCreateMediaMention,
  useMediaMentionById,
  useUpdateMediaMention
} from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useCreateNews, useNewsById, useUpdateNews } from '~/shared/hooks/use-news/useNews';
import { BaseContentStatuses } from '~/types/enums/common.enums';
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
  const isEditing = Boolean(id);

  const isValidType = PUBLICATIONS_TYPES.includes(type);
  const publicationType = type;
  const mode = isEditing ? 'Редагування' : 'Створення';
  const pageTitle = isValidType ? `${mode} ${PAGE_TITLES[publicationType]}` : '';

  const newsQuery = useNewsById(id as string, { skip: type !== 'news' || !isEditing });
  const eventQuery = useEventById(id as string, { skip: type !== 'events' || !isEditing });
  const mediaQuery = useMediaMentionById(id as string, { skip: type !== 'media' || !isEditing });

  const [createNews] = useCreateNews();
  const [createEvent] = useCreateEvent();
  const [createMediaMention] = useCreateMediaMention();

  const [updateEvent] = useUpdateEvent();
  const [updateNews] = useUpdateNews();
  const [updateMediaMention] = useUpdateMediaMention();

  const [adminTitle, setAdminTitle] = useState('');
  const [adminTitleError, setAdminTitleError] = useState('');
  const [canonicalUrlError, setCanonicalUrlError] = useState('');
  const [publishDate, setPublishDate] = useState<Dayjs | null>(null);
  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialSeoValue);

  const [crop, setCrop] = useState<ImageCropData>(null);

  const [initialState, setInitialState] = useState<{
    adminTitle: string;
    publishDate: string | null;
    seoValue: SeoBlockValue;
    crop: ImageCropData;
  } | null>(null);
  const [forceShowErrors, setForceShowErrors] = useState(false);

  const latestDataRef = useRef({
    adminTitle: '',
    publishDate: null as Dayjs | null,
    seoValue: initialSeoValue,
    crop: null as ImageCropData | null
  });

  const isInitializedRef = useRef(false);

  const changeAdminTitle = (val: string) => {
    latestDataRef.current.adminTitle = val;
    setAdminTitle(val);
  };
  const changePublishDate = (val: Dayjs | null) => {
    latestDataRef.current.publishDate = val;
    setPublishDate(val);
  };
  const changeSeoValue = (val: SeoBlockValue | ((prev: SeoBlockValue) => SeoBlockValue)) => {
    const newValue = typeof val === 'function' ? val(latestDataRef.current.seoValue) : val;
    latestDataRef.current.seoValue = newValue;
    setSeoValue(newValue);
  };

  const changeCrop = (val: ImageCropData) => {
    latestDataRef.current.crop = val;
    setCrop(val);
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
      changeAdminTitle(fetchedData.adminTitle || '');

      const safeParseDate = (dateVal: Dayjs | string | null | undefined) => {
        if (!dateVal) return null;
        const num = Number(dateVal);
        return dayjs(Number.isNaN(num) ? dateVal : num);
      };

      const mainDate = type === 'news' ? fetchedData.newsDate : fetchedData.publishedAt;
      changePublishDate(safeParseDate(mainDate));

      changeCrop(fetchedData.coverImage?.crop ?? null);

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

      changeSeoValue({
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

      setInitialState({
        adminTitle: fetchedData.adminTitle || '',
        publishDate: safeParseDate(mainDate)?.toISOString() ?? null,
        seoValue: {
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
        },
        crop: fetchedData.coverImage?.crop ?? null
      });

      isInitializedRef.current = true;
    }
  }, [isEditing, type, newsQuery.data, eventQuery.data, mediaQuery.data]);

  const handleSave = async (status: BaseContentStatuses) => {
    if (!isValidType) return;

    const { adminTitle, seoValue, publishDate, crop } = latestDataRef.current;
    const { uk: ukMeta, en: enMeta } = seoValue.meta;

    const isTitleInvalid = !adminTitle.trim();
    const isSeoInvalid = checkIsSeoInvalid(ukMeta, enMeta, publicationType, seoValue.ticketUrl);

    if (isTitleInvalid || isSeoInvalid) {
      if (isTitleInvalid) setAdminTitleError('Обов\'язкове поле');
      if (isSeoInvalid) setForceShowErrors(true);
      return;
    }

    const commonInput = {
      adminTitle,
      title: { uk: ukMeta.title || adminTitle, en: enMeta.title || adminTitle },
      description: { uk: ukMeta.description || '', en: enMeta.description || '' },
      keywords: { uk: ukMeta.keywords || '', en: enMeta.keywords || '' },
      allowIndexation: { uk: seoValue.allowIndexing.uk, en: seoValue.allowIndexing.en },
      publishedAt: publishDate?.toISOString(),
      coverImage: {
        src: seoValue.ogImage || adminTitle,
        alt: { uk: ukMeta.altText?.uk || adminTitle, en: enMeta.altText?.en || adminTitle },
        caption: { uk: adminTitle, en: adminTitle },
        ...buildCoverImageCropPayload(crop)
      }
    };

    try {
      const emptyContent = { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } };
      const isUpdate = isEditing && id;

      const saveStrategies: Record<string, () => Promise<string | void>> = {
        events: async () => {
          const payload = {
            ...commonInput,
            eventLink: adminTitle,
            eventDateTimeStart: ukMeta.startDateTime,
            eventDateTimeEnd: ukMeta.endDateTime,
            ticketUrl: seoValue.ticketUrl,
            status: status as unknown as EventStatus
          };
          if (isUpdate) return updateEvent({ id, input: payload }).then(() => id);
          return createEvent({
            ...payload,
            content: emptyContent
          }).then((r) => r.data?.createEvent?.id);
        },
        news: async () => {
          const payload = {
            ...commonInput,
            newsDate: commonInput.publishedAt,
            status: status as unknown as NewsStatus
          };
          if (isUpdate) return updateNews({ id, input: payload }).then(() => id);
          return createNews({
            ...payload,
            content: emptyContent
          }).then((r) => r.data?.createNews?.id);
        },
        media: async () => {
          const payload = {
            ...commonInput,
            url: ukMeta.canonicalUrl || enMeta.canonicalUrl || adminTitle,
            status: status as unknown as MediaStatus
          };
          if (isUpdate) {
            const response = await updateMediaMention(id, payload);
            return response.data?.updateMediaMention.id;
          } else {
            const response = await createMediaMention(payload);
            return response.data?.createMediaMention.id;
          }
        }
      };

      const resultId = await saveStrategies[publicationType]?.();
      setCanonicalUrlError('');

      return resultId;
    } catch (error: unknown) {
      console.error('Error: ', error);
      if (error instanceof Error) {
        const errorMessage = error.message || '';

        if (errorMessage.includes('E11000')) {
          let errorMsg = '';
          if (errorMessage.includes('url_1')) {
            errorMsg = 'Публікація з таким canonical URL вже існує.';
          } else {
            errorMsg = 'Публікація з такими даними вже існує.';
          }
          setCanonicalUrlError(errorMsg);
        } else {
          toast.error('Щось пішло не так.');
        }
      }
    }
  };

  const handleDateTimeChange = useCallback((start: string | undefined, end: string | undefined) => {
    changeSeoValue((prev) => ({
      ...prev,
      meta: {
        uk: { ...prev.meta.uk, startDateTime: start, endDateTime: end },
        en: { ...prev.meta.en, startDateTime: start, endDateTime: end }
      }
    }));
  }, []);

  const hasUnsavedChanges =
    initialState !== null &&
    JSON.stringify({
      adminTitle,
      publishDate: publishDate?.toISOString() ?? null,
      seoValue,
      crop
    }) !==
    JSON.stringify({
      adminTitle: initialState.adminTitle,
      publishDate: initialState.publishDate,
      seoValue: initialState.seoValue,
      crop: initialState.crop
    });

  return {
    isEditing,
    isLoading: isEditing && (newsQuery.loading || eventQuery.loading || mediaQuery.loading),
    isValidType,
    publicationType,
    pageTitle,
    adminTitle,
    setAdminTitle: changeAdminTitle,
    adminTitleError,
    setAdminTitleError,
    canonicalUrlError,
    setCanonicalUrlError,
    publishDate,
    setPublishDate: changePublishDate,
    seoValue,
    setSeoValue: changeSeoValue,
    hasUnsavedChanges,

    crop,
    setCrop: changeCrop,

    forceShowErrors,
    handleSave,
    handleDateTimeChange
  };
};
