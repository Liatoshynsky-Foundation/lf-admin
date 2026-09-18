import dayjs, { type Dayjs } from 'dayjs';
import { useCallback,useRef, useState } from 'react';

import { seoFormErrors } from '~/constants/errors';
import {
  ImageCropData,
  initialSeoValue,
  PUBLICATION_SEO_REQUIRED,
  PublicationsItemType
} from '~/constants/publications';
import { checkIsSeoInvalid } from '~/lib/utils/checkIsSeoInvalid';
import { buildCoverImageCropPayload } from '~/lib/utils/CropperHelper';
import type {
  SeoBlockErrors,
  SeoBlockValue
} from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import type { LocalizedMeta } from '~/shared/components/forms/seo-metadata-form/SeoMetadataForm';
import { type SeoField, validateSeoField } from '~/shared/components/forms/seo-metadata-form/validateSeoField';

export const isValidDate = (date: Dayjs | null | undefined): date is Dayjs => Boolean(date?.isValid());

export const parseDate = (dateVal: Dayjs | string | null | undefined) => {
  if (!dateVal) return null;
  if (typeof dateVal !== 'string') return isValidDate(dateVal) ? dateVal : null;

  const trimmedDateVal = dateVal.trim();
  if (!trimmedDateVal) return null;

  const timestamp = Number(trimmedDateVal);
  const parsedDate = dayjs(Number.isNaN(timestamp) ? trimmedDateVal : timestamp);

  return isValidDate(parsedDate) ? parsedDate : null;
};

export const getDateIsoString = (date: Dayjs | null | undefined) => (isValidDate(date) ? date.toISOString() : undefined);

const getPublicationSeoMetaErrors = (
  meta: LocalizedMeta,
  locale: 'uk' | 'en',
  requiredFields: Readonly<{ title: boolean; description: boolean }>
): Partial<Record<keyof LocalizedMeta, string>> => {
  const getError = (field: SeoField, value: string, required = false): string => {
    const code = validateSeoField(field, value, { required });
    return code ? seoFormErrors[locale][code] : '';
  };

  const isRequired = (field: 'title' | 'description', value: string): boolean =>
    requiredFields[field] || Boolean(value.trim());

  return {
    title: getError('title', meta.title, isRequired('title', meta.title)),
    description: getError('description', meta.description, isRequired('description', meta.description)),
    keywords: getError('keywords', meta.keywords),
    altText: getError('altText', meta.altText?.[locale] ?? '')
  };
};

const getTicketUrlError = (value: string, locale: 'uk' | 'en'): string => {
  if (!value.trim()) return seoFormErrors[locale].required;
  try {
    new URL(value);
    return '';
  } catch {
    return seoFormErrors[locale].invalidUrl;
  }
};

export const validatePublicationSeo = (
  seoValue: SeoBlockValue,
  publicationType: PublicationsItemType
): { seoErrors: SeoBlockErrors; hasMetaErrors: boolean; hasUrlErrors: boolean } => {
  const { uk: ukMeta, en: enMeta } = seoValue.meta;
  const hasUrlErrors = checkIsSeoInvalid(ukMeta, enMeta, publicationType, seoValue.ticketUrl);

  const seoErrors: SeoBlockErrors = {
    meta: {
      uk: getPublicationSeoMetaErrors(ukMeta, 'uk', PUBLICATION_SEO_REQUIRED.uk),
      en: getPublicationSeoMetaErrors(enMeta, 'en', PUBLICATION_SEO_REQUIRED.en)
    },
    ...(publicationType === 'events' && hasUrlErrors
      ? {
        ticketUrl: {
          uk: getTicketUrlError(seoValue.ticketUrl?.uk ?? '', 'uk'),
          en: getTicketUrlError(seoValue.ticketUrl?.en ?? '', 'en')
        }
      }
      : {})
  };

  return {
    seoErrors,
    hasMetaErrors: Object.values(seoErrors.meta).some((errors) => Object.values(errors).some(Boolean)),
    hasUrlErrors
  };
};

export type PublicationFormState = {
  adminTitle: string;
  publishDate: string | null;
  seoValue: SeoBlockValue;
  crop: ImageCropData;
};

export const usePublicationForm = () => {
  const [adminTitle, setAdminTitle] = useState('');
  const [adminTitleError, setAdminTitleError] = useState('');
  const [canonicalUrlError, setCanonicalUrlError] = useState('');
  const [publishDate, setPublishDate] = useState<Dayjs | null>(null);
  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialSeoValue);
  const [crop, setCrop] = useState<ImageCropData>(null);

  const [initialState, setInitialState] = useState<PublicationFormState | null>(null);
  const [forceShowErrors, setForceShowErrors] = useState(false);
  const [seoErrors, setSeoErrors] = useState<SeoBlockErrors | undefined>();

  const latestDataRef = useRef({
    adminTitle: '',
    publishDate: null as Dayjs | null,
    seoValue: initialSeoValue,
    crop: null as ImageCropData | null
  });

  const changeAdminTitle = useCallback((val: string) => {
    latestDataRef.current.adminTitle = val;
    setAdminTitle(val);
  }, []);

  const changePublishDate = useCallback((val: Dayjs | null) => {
    latestDataRef.current.publishDate = val;
    setPublishDate(val);
  }, []);

  const changeSeoValue = useCallback((val: SeoBlockValue | ((prev: SeoBlockValue) => SeoBlockValue)) => {
    setSeoValue((prevValue) => {
      const newValue = typeof val === 'function' ? val(prevValue) : val;
      latestDataRef.current.seoValue = newValue;
      return newValue;
    });
    setSeoErrors(undefined);
  }, []);

  const changeCrop = useCallback((val: ImageCropData) => {
    latestDataRef.current.crop = val;
    setCrop(val);
  }, []);

  const handleDateTimeChange = useCallback((start: string | undefined, end: string | undefined) => {
    changeSeoValue((prev) => ({
      ...prev,
      meta: {
        uk: { ...prev.meta.uk, startDateTime: start, endDateTime: end },
        en: { ...prev.meta.en, startDateTime: start, endDateTime: end }
      }
    }));
  }, [changeSeoValue]);

  const hasUnsavedChanges =
    initialState !== null &&
    JSON.stringify({
      adminTitle,
      publishDate: getDateIsoString(publishDate) ?? null,
      seoValue,
      crop
    }) !== JSON.stringify(initialState);

  const buildCommonInput = useCallback(() => {
    const { adminTitle, seoValue, publishDate, crop } = latestDataRef.current;
    const { uk: ukMeta, en: enMeta } = seoValue.meta;

    return {
      adminTitle,
      title: { 
        uk: ukMeta.title || adminTitle, 
        en: enMeta.title || adminTitle 
      },
      description: { uk: ukMeta.description || '', en: enMeta.description || '' },
      keywords: { uk: ukMeta.keywords || '', en: enMeta.keywords || '' },
      allowIndexation: { uk: seoValue.allowIndexing.uk, en: seoValue.allowIndexing.en },
      publishedAt: getDateIsoString(publishDate),
      coverImage: {
        src: seoValue.ogImage || adminTitle,
        alt: {
          uk: ukMeta.altText?.uk?.trim() || adminTitle,
          en: enMeta.altText?.en?.trim() || adminTitle
        },
        caption: { uk: adminTitle, en: adminTitle },
        ...buildCoverImageCropPayload(crop)
      }
    };
  }, []);

  return {
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
    crop,
    setCrop: changeCrop,
    hasUnsavedChanges,
    seoErrors,
    setSeoErrors,
    forceShowErrors,
    setForceShowErrors,
    initialState,
    setInitialState,
    handleDateTimeChange,
    buildCommonInput,
    latestDataRef
  };
};
