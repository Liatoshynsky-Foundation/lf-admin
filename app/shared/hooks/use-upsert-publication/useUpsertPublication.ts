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
import { checkIsSeoInvalid } from '~/lib/utils/checkIsSeoInvalid';
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

const ERROR_CONFIG: Array<{
  key: string;
  handle: (ctx: { setCanonicalUrlError: (msg: string) => void }) => void;
}> = [
  {
    key: 'url_1',
    handle: ({ setCanonicalUrlError }) => setCanonicalUrlError('Публікація з таким canonical URL вже існує.')
  },
  {
    key: 'E11000',
    handle: () => toast.error('Публікація з такими даними вже існує.')
  }
];
interface UseUpsertPublicationProps {
  type: PublicationsItemType;
  id?: string;
}

const isValidDate = (date: Dayjs | null | undefined): date is Dayjs => Boolean(date?.isValid());

const parseDate = (dateVal: Dayjs | string | null | undefined) => {
  if (!dateVal) return null;

  if (typeof dateVal !== 'string') return isValidDate(dateVal) ? dateVal : null;

  const trimmedDateVal = dateVal.trim();
  if (!trimmedDateVal) return null;

  const timestamp = Number(trimmedDateVal);
  const parsedDate = dayjs(Number.isNaN(timestamp) ? trimmedDateVal : timestamp);

  return isValidDate(parsedDate) ? parsedDate : null;
};

const getDateIsoString = (date: Dayjs | null | undefined) => (isValidDate(date) ? date.toISOString() : undefined);

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

      const mainDate = type === 'news' ? fetchedData.newsDate : fetchedData.publishedAt;
      changePublishDate(parseDate(mainDate));

      changeCrop(fetchedData.coverImage?.crop ?? null);

      const getLangMeta = (lang: 'uk' | 'en') => {
        const start = parseDate(fetchedData?.eventDateTimeStart);
        const end = parseDate(fetchedData?.eventDateTimeEnd);

        return {
          title: fetchedData?.title?.[lang] || '',
          description: fetchedData?.description?.[lang] || '',
          keywords: fetchedData?.keywords?.[lang] || '',

          canonicalUrl: type === 'media' ? fetchedData?.url || '' : '',
          altText: {
            uk: fetchedData?.coverImage?.alt?.uk || '',
            en: fetchedData?.coverImage?.alt?.en || ''
          },
          startDateTime: getDateIsoString(start),
          endDateTime: getDateIsoString(end)
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
        publishDate: getDateIsoString(parseDate(mainDate)) ?? null,
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
    const isPublishDateInvalid = Boolean(publishDate && !publishDate.isValid());

    if (isTitleInvalid || isSeoInvalid || isPublishDateInvalid) {
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
      publishedAt: getDateIsoString(publishDate),
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

      const saveStrategies: Record<
        string,
        () => Promise<{
          id: string | undefined;
          slug: string | undefined;
        }>
      > = {
        events: async () => {
          const payload = {
            ...commonInput,
            eventLink: adminTitle,
            eventDateTimeStart: ukMeta.startDateTime,
            eventDateTimeEnd: ukMeta.endDateTime,
            ticketUrl: seoValue.ticketUrl,
            status: status as unknown as EventStatus
          };
          if (isUpdate)
            return updateEvent({ id, input: payload }).then((data) => ({
              id: data.data?.updateEvent.id,
              slug: data.data?.updateEvent.slug
            }));
          return createEvent({
            ...payload,
            content: emptyContent
          }).then((r) => ({ id: r.data?.createEvent?.id, slug: r.data?.createEvent?.slug }));
        },
        news: async () => {
          const payload = {
            ...commonInput,
            newsDate: commonInput.publishedAt,
            status: status as unknown as NewsStatus
          };
          if (isUpdate)
            return updateNews({ id, input: payload }).then((data) => ({
              id: data.data?.updateNews.id,
              slug: data.data?.updateNews.slug
            }));
          return createNews({
            ...payload,
            content: emptyContent
          }).then((r) => ({ id: r.data?.createNews?.id, slug: r.data?.createNews?.slug }));
        },
        media: async () => {
          const payload = {
            ...commonInput,
            url: ukMeta.canonicalUrl || enMeta.canonicalUrl || adminTitle,
            status: status as unknown as MediaStatus
          };
          if (isUpdate) {
            const response = await updateMediaMention(id, payload);
            return { id: response.data?.updateMediaMention?.id, slug: response.data?.updateMediaMention?.slug };
          } else {
            const response = await createMediaMention(payload);
            return { id: response.data?.createMediaMention?.id, slug: response.data?.createMediaMention?.slug };
          }
        }
      };

      const result = await saveStrategies[publicationType]?.();
      setCanonicalUrlError('');

      return { id: result?.id, slug: result.slug };
    } catch (error: unknown) {
      console.error('Error: ', error);
      if (error instanceof Error) {
        const errorMessage = error.message || '';
        const matched = ERROR_CONFIG.find((item) => errorMessage.includes(item.key));

        if (!matched) {
          toast.error('Щось пішло не так. Спробуйте ще раз.');
          return;
        }

        matched.handle({ setCanonicalUrlError });
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
      publishDate: getDateIsoString(publishDate) ?? null,
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
