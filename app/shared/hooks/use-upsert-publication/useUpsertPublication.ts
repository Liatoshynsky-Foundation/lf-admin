import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { getDateIsoString, parseDate, usePublicationForm, validatePublicationSeo } from './usePublicationForm';
import { usePublicationStrategy } from './usePublicationStrategy';
import { publicationErrors } from '~/constants/errors';
import { PAGE_TITLES, PUBLICATIONS_TYPES, PublicationsItemType } from '~/constants/publications';
import { useSystemPreview } from '~/shared/hooks/use-system-preview/useSystemPreview';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const getErrorConfig = (locale: 'uk' | 'en') => [
  {
    key: 'url_1',
    handle: ({ setCanonicalUrlError }: { setCanonicalUrlError: (msg: string) => void }) =>
      setCanonicalUrlError(publicationErrors[locale].duplicateCanonicalUrl)
  },
  {
    key: 'E11000',
    handle: () => toast.error(publicationErrors[locale].duplicateData)
  }
];

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

  const { findSystemPreviewDocument } = useSystemPreview();

  const strategy = usePublicationStrategy(type, id);
  const form = usePublicationForm();

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isEditing || isInitializedRef.current || !strategy.data) return;

    const fetchedData = strategy.data;
    form.setAdminTitle(fetchedData.adminTitle || '');

    const mainDate = strategy.extractDate(fetchedData);
    form.setPublishDate(parseDate(mainDate));
    form.setCrop(fetchedData.coverImage?.crop ?? null);

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

    const initialSeo = {
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
    };

    form.setSeoValue(initialSeo);

    form.setInitialState({
      adminTitle: fetchedData.adminTitle || '',
      publishDate: getDateIsoString(parseDate(mainDate)) ?? null,
      seoValue: initialSeo,
      crop: fetchedData.coverImage?.crop ?? null
    });

    isInitializedRef.current = true;
  }, [isEditing, type, strategy, form]);

  const handleSave = async (status: BaseContentStatuses, locale: 'uk' | 'en' = 'uk') => {
    if (!isValidType) return;

    const { adminTitle, seoValue, publishDate } = form.latestDataRef.current;

    const isTitleInvalid = !adminTitle.trim();
    const isPublishDateInvalid = Boolean(publishDate && !publishDate.isValid());

    const {
      seoErrors: nextSeoErrors,
      hasMetaErrors,
      hasUrlErrors
    } = validatePublicationSeo(seoValue, publicationType);

    if (isTitleInvalid || hasMetaErrors || hasUrlErrors || isPublishDateInvalid) {
      if (isTitleInvalid) form.setAdminTitleError('Обов\'язкове поле');
      if (hasMetaErrors || hasUrlErrors) {
        form.setSeoErrors(nextSeoErrors);
        form.setForceShowErrors(true);
      }
      return;
    }

    try {
      const payload = form.buildCommonInput();
      const targetId = (isEditing && id) ? id : undefined;
      const formState = { adminTitle, publishDate: getDateIsoString(publishDate) ?? null, seoValue, crop: form.latestDataRef.current.crop };

      const result = await strategy.saveDocument(status, payload, formState, targetId);
      form.setCanonicalUrlError('');

      return { id: result?.id, slug: result?.slug };
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message || '';
        const errorConfig = getErrorConfig(locale);
        const matched = errorConfig.find((item) => errorMessage.includes(item.key));

        if (!matched) {
          toast.error(publicationErrors[locale].genericError);
          return;
        }

        matched.handle({ setCanonicalUrlError: form.setCanonicalUrlError });
      }
    }
  };

  const handlePreviewSave = async (locale: 'uk' | 'en' = 'uk') => {
    if (!strategy.previewConfig) return null;

    const { slug: previewSlug, query: DocumentQuery, itemsAccessor } = strategy.previewConfig;

    try {
      const existingDocId = await findSystemPreviewDocument(
        DocumentQuery,
        { filters: { search: previewSlug } },
        previewSlug,
        itemsAccessor
      );

      const basePayload = form.buildCommonInput();
      const { adminTitle, seoValue, publishDate, crop } = form.latestDataRef.current;
      const formState = { adminTitle, publishDate: getDateIsoString(publishDate) ?? null, seoValue, crop };

      const previewPayload = {
        ...basePayload,
        slug: previewSlug,
        adminTitle: previewSlug,
        allowIndexation: { uk: false, en: false }
      };

      const result = await strategy.saveDocument(BaseContentStatuses.Draft, previewPayload, formState, existingDocId);

      return result ? { id: result.id as string, slug: result.slug as string } : null;
    } catch {
      toast.error(publicationErrors[locale].previewPreparationFailed);
      return null;
    }
  };

  return {
    isEditing,
    isLoading: isEditing && strategy.loading,
    isValidType,
    publicationType,
    pageTitle,
    ...form,
    handleSave,
    handlePreviewSave
  };
};
