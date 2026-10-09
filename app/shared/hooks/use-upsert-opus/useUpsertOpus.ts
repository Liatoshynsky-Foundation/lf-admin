import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { buildOpusInput } from './opusMappers';
import { seoFormErrors } from '~/constants/errors';
import {
  COMPOSITION_DUPLICATE_ERROR,
  COMPOSITION_NAME_REQUIRED_ERROR,
  COMPOSITION_REQUIRED_FIELDS_ERROR,
  initialOpusDetails,
  initialOpusSeoValue,
  OPUS_FIELD_LIMITS,
  OPUS_MUTATION_RESULTS,
  OPUS_VALIDATION_MESSAGES
} from '~/constants/opus';
import {
  getCompositionFieldErrors,
  getDuplicateCompositionError,
  getDuplicateCompositionIds,
  getErrorMessage,
  getInvalidCompositionIds,
  isCompositionNameRequiredError,
  normalizeCompositionName
} from '~/lib/utils/compositionErrors';
import { fetchPreview } from '~/lib/utils/fetchPreview';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import type {
  SeoBlockErrors,
  SeoBlockValue
} from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import type { LocalizedMeta } from '~/shared/components/forms/seo-metadata-form/SeoMetadataForm';
import { type SeoField, validateSeoField } from '~/shared/components/forms/seo-metadata-form/validateSeoField';
import { useCreateOpus, useOpusById, useUpdateOpus, useUpsertOpusPreview } from '~/shared/hooks/use-opuses/useOpuses';
import { fileNameFromUrl } from '~/src/shared/utils/assets/assetFilename';
import { CropRect } from '~/types/common';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type {
  FetchedOpusData,
  OpusDetailsErrors,
  OpusDetailsValue
} from '~/types/opus';

export { toCompositionInput } from './opusMappers';

export const createCompositionId = (): string => generateUniqueId();

const getSeoMetaErrors = (
  meta: SeoBlockValue['meta']['uk'],
  altLocale: 'uk' | 'en',
  hasPreviewImage: boolean
): Partial<Record<keyof LocalizedMeta, string>> => {
  const getError = (field: SeoField, value: string, required = false): string => {
    const error = validateSeoField(field, value, { required });
    return error ? seoFormErrors[altLocale][error] : '';
  };

  return {
    title: getError('title', meta.title),
    description: getError('description', meta.description),
    keywords: getError('keywords', meta.keywords),
    altText: hasPreviewImage ? getError('altText', meta.altText?.[altLocale] ?? '', true) : ''
  };
};

interface UseUpsertOpusProps {
  id?: string;
}

export type UseUpsertOpusResult = {
  isEditing: boolean;
  isLoading: boolean;

  details: OpusDetailsValue;
  setDetails: (value: OpusDetailsValue | ((prev: OpusDetailsValue) => OpusDetailsValue)) => void;

  detailsErrors: OpusDetailsErrors;
  handleDetailsFieldBlur: (field: 'number' | 'name' | 'creationYear', value: string) => void;

  compositionErrors: Record<string, string>;

  seoValue: SeoBlockValue;
  setSeoValue: (value: SeoBlockValue | ((prev: SeoBlockValue) => SeoBlockValue)) => void;

  seoErrors?: SeoBlockErrors;

  crop: CropRect | null;
  setCrop: (value: CropRect | null) => void;

  isSaved: boolean;

  handleSave: (status: BaseContentStatuses) => Promise<string | undefined>;
  handlePreview: () => Promise<void>;
};

export const useUpsertOpus = ({ id }: UseUpsertOpusProps = {}): UseUpsertOpusResult => {
  const isEditing = Boolean(id);
  const opusQuery = useOpusById(id ?? '', { skip: !isEditing });

  const [createOpus] = useCreateOpus();
  const [updateOpus] = useUpdateOpus();
  const [upsertOpusPreview] = useUpsertOpusPreview();

  const [details, setDetails] = useState<OpusDetailsValue>(initialOpusDetails);
  const [detailsErrors, setDetailsErrors] = useState<OpusDetailsErrors>({
    number: '',
    name: '',
    creationYear: ''
  });

  const [compositionErrors, setCompositionErrors] = useState<Record<string, string>>({});

  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialOpusSeoValue);
  const [seoErrors, setSeoErrors] = useState<SeoBlockErrors>({ meta: { uk: {}, en: {} } });

  const [crop, setCrop] = useState<CropRect | null>(null);
  const [isSaved, setIsSaved] = useState(isEditing);

  const latestDataRef = useRef({ details, seoValue, crop });
  const isInitializedRef = useRef(false);

  const clearCompositionErrors = useCallback(() => setCompositionErrors({}), []);

  const changeDetails = useCallback(
    (value: OpusDetailsValue | ((prev: OpusDetailsValue) => OpusDetailsValue)) => {
      const previousDetails = latestDataRef.current.details;

      const next = typeof value === 'function' ? value(previousDetails) : value;

      latestDataRef.current.details = next;

      setDetails(next);
      setIsSaved(false);

      if (next.compositions !== previousDetails.compositions) {
        clearCompositionErrors();
      }

      setDetailsErrors((prev) => ({
        number: next.number.trim() ? '' : prev.number,
        name: next.name.trim() ? '' : prev.name,
        creationYear: next.creationYear.trim() ? '' : prev.creationYear
      }));
    },
    [clearCompositionErrors]
  );

  const changeSeoValue = useCallback((value: SeoBlockValue | ((prev: SeoBlockValue) => SeoBlockValue)) => {
    const next = typeof value === 'function' ? value(latestDataRef.current.seoValue) : value;
    latestDataRef.current.seoValue = next;
    setSeoValue(next);
    setIsSaved(false);
  }, []);

  const changeCrop = useCallback((value: CropRect | null) => {
    latestDataRef.current.crop = value;
    setCrop(value);
    setIsSaved(false);
  }, []);

  useEffect(() => {
    if (!isEditing || isInitializedRef.current) {
      return;
    }

    const fetched = opusQuery.data?.opusById as FetchedOpusData | undefined | null;
    if (!fetched) {
      return;
    }

    changeDetails({
      numberKind: fetched.numberKind ?? 'op',
      number: fetched.number.toString() ?? '',
      name: fetched.name?.uk ?? '',
      additionalText: fetched.additionalText ?? '',
      creationYear: fetched.creationYear ?? '',
      endYear: fetched.endYear ?? '',
      datesNote: fetched.datesNote ?? '',
      genre: fetched.genre?.uk ?? '',
      compositions: (fetched.compositions ?? []).map((composition) => ({
        id: composition.id,
        name: composition.name?.uk ?? '',
        genre: composition.genre ?? '',
        year: composition.year == null ? '' : String(composition.year),
        audios: (composition.audios ?? []).map((audio) => ({
          id: createCompositionId(),
          name: audio.name ?? fileNameFromUrl(audio.url),
          fileUrl: audio.url ?? ''
        })),
        notes: (composition.sheetMusic ?? []).map((sheet) => ({
          id: createCompositionId(),
          name: sheet.name ?? '',
          fileUrl: sheet.url ?? '',
          fileName: sheet.fileName ?? fileNameFromUrl(sheet.url),
          publishDate: sheet.publishDate ?? ''
        }))
      }))
    });

    changeCrop(fetched.coverImage?.crop ?? null);

    changeSeoValue({
      meta: {
        uk: {
          title: fetched.title?.uk ?? '',
          description: fetched.description?.uk ?? '',
          keywords: fetched.keywords?.uk ?? '',
          altText: { uk: fetched.coverImage?.alt?.uk ?? '', en: fetched.coverImage?.alt?.en ?? '' }
        },
        en: {
          title: fetched.title?.en ?? '',
          description: fetched.description?.en ?? '',
          keywords: fetched.keywords?.en ?? '',
          altText: { uk: fetched.coverImage?.alt?.uk ?? '', en: fetched.coverImage?.alt?.en ?? '' }
        }
      },
      ogImage: fetched.coverImage?.src ?? null,
      allowIndexing: {
        uk: fetched.allowIndexation?.uk ?? true,
        en: fetched.allowIndexation?.en ?? true
      }
    });

    isInitializedRef.current = true;
    setIsSaved(true);
  }, [changeDetails, changeSeoValue, changeCrop, isEditing, opusQuery.data]);

  const validateDetailsField = (field: 'number' | 'name' | 'creationYear', value: string): string => {
    const trimmedValue = value.trim();

    if (field === 'number') {
      if (!trimmedValue) {
        return OPUS_VALIDATION_MESSAGES.numberRequired;
      } else if (!/^\d+$/.test(trimmedValue) || Number(trimmedValue) <= 0) {
        return OPUS_VALIDATION_MESSAGES.numberInvalid;
      }
    }

    if (field === 'name') {
      if (!trimmedValue) {
        return OPUS_VALIDATION_MESSAGES.nameRequired;
      } else if (trimmedValue.length < OPUS_FIELD_LIMITS.name.min) {
        return OPUS_VALIDATION_MESSAGES.nameTooShort;
      }
    }

    if (field === 'creationYear' && !trimmedValue) {
      return OPUS_VALIDATION_MESSAGES.creationYearRequired;
    }

    return '';
  };

  const handleDetailsFieldBlur = (field: 'number' | 'name' | 'creationYear', value: string): void => {
    const error = validateDetailsField(field, value);
    setDetailsErrors((prev) => ({
      ...prev,
      [field]: error
    }));
  };

  const validateDetails = (value: OpusDetailsValue): boolean => {
    const numberError = validateDetailsField('number', value.number);
    const nameError = validateDetailsField('name', value.name);
    const creationYearError = validateDetailsField('creationYear', value.creationYear);

    const errors: OpusDetailsErrors = {
      number: numberError,
      name: nameError,
      creationYear: creationYearError
    };

    setDetailsErrors(errors);

    const invalidIds = getInvalidCompositionIds(value.compositions);
    const titleErrors = getCompositionFieldErrors(value.compositions);
    setCompositionErrors(titleErrors);

    const duplicateIds = getDuplicateCompositionIds(value.compositions);
    if (duplicateIds.length > 0) {
      toast.error(COMPOSITION_DUPLICATE_ERROR);
    }

    if (invalidIds.length > 0) {
      toast.error(COMPOSITION_NAME_REQUIRED_ERROR);
    }

    const hasTopLevelValidationErrors = Boolean(numberError || nameError || creationYearError);
    const hasCompositionValidationErrors =
      Object.keys(titleErrors).length > 0 && invalidIds.length === 0 && duplicateIds.length === 0;

    if (hasTopLevelValidationErrors || hasCompositionValidationErrors) {
      toast.error(COMPOSITION_REQUIRED_FIELDS_ERROR);
    }

    return (
      !numberError &&
      !nameError &&
      !creationYearError &&
      invalidIds.length === 0 &&
      Object.keys(titleErrors).length === 0 &&
      duplicateIds.length === 0
    );
  };

  const handleMutationError = (error: unknown): void => {
    const message = getErrorMessage(error);

    const duplicateError = getDuplicateCompositionError(error);

    if (duplicateError) {
      const duplicateErrors = Object.fromEntries(
        latestDataRef.current.details.compositions
          .filter((composition) => normalizeCompositionName(composition.name) === duplicateError.name)
          .map((composition) => [`compositions.${composition.id}.name`, duplicateError.message])
      );
      setCompositionErrors((previous) => ({ ...previous, ...duplicateErrors }));

      toast.error(duplicateError.message);
      return;
    }

    if (isCompositionNameRequiredError(error)) {
      const invalidIds = getInvalidCompositionIds(latestDataRef.current.details.compositions);
      setCompositionErrors(Object.fromEntries(invalidIds.map((id) => [`compositions.${id}.name`, ''])));

      toast.error(COMPOSITION_NAME_REQUIRED_ERROR);
      return;
    }

    toast.error(message);
  };

  const handleSave = async (status: BaseContentStatuses): Promise<string | undefined> => {
    const { details: currentDetails, seoValue: currentSeo, crop: currentCrop } = latestDataRef.current;
    const { uk: ukMeta, en: enMeta } = currentSeo.meta;
    const nextSeoErrors = {
      meta: {
        uk: getSeoMetaErrors(ukMeta, 'uk', Boolean(currentSeo.ogImage)),
        en: getSeoMetaErrors(enMeta, 'en', Boolean(currentSeo.ogImage))
      }
    };
    const hasSeoErrors = Object.values(nextSeoErrors.meta).some((errors) => Object.values(errors).some(Boolean));

    setSeoErrors(nextSeoErrors);

    if (!validateDetails(currentDetails)) {
      return undefined;
    }

    clearCompositionErrors();

    if (hasSeoErrors) {
      toast.error(COMPOSITION_REQUIRED_FIELDS_ERROR);
      return undefined;
    }

    const input = buildOpusInput({
      details: currentDetails,
      seoValue: currentSeo,
      crop: currentCrop,
      isEditing,
      status
    });

    try {
      let savedId: string | undefined;

      if (isEditing && id) {
        const response = await updateOpus({ id, input });
        savedId = response.data?.updateOpus?.id;
      } else {
        const response = await createOpus(input);
        savedId = response.data?.createOpus?.id;
      }

      if (!savedId) {
        toast.error(isEditing ? OPUS_MUTATION_RESULTS.updateFailed : OPUS_MUTATION_RESULTS.createFailed);
        return undefined;
      }

      setIsSaved(true);

      toast.success(isEditing ? OPUS_MUTATION_RESULTS.updated : OPUS_MUTATION_RESULTS.created);
      return savedId;
    } catch (error) {
      handleMutationError(error);
      return undefined;
    }
  };

  const handlePreview = async (): Promise<void> => {
    if (!isEditing || !id) {
      return;
    }

    const { details: currentDetails, seoValue: currentSeo, crop: currentCrop } = latestDataRef.current;
    const input = buildOpusInput({
      details: currentDetails,
      seoValue: currentSeo,
      crop: currentCrop,
      isEditing
    });

    try {
      const result = await upsertOpusPreview({ sourceId: id, input });
      const previewOpus = result.data?.upsertOpusPreview;

      if (!previewOpus?.id || !previewOpus.slug) {
        toast.error('Не вдалося підготувати передогляд');
        return;
      }

      await fetchPreview({
        slug: `artistry/${previewOpus.slug}`,
        lang: 'uk',
        draftId: previewOpus.id
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося підготувати передогляд');
    }
  };

  return {
    isEditing,
    isLoading: isEditing && opusQuery.loading,
    details,
    setDetails: changeDetails,
    detailsErrors,
    handleDetailsFieldBlur,
    compositionErrors,
    seoValue,
    setSeoValue: changeSeoValue,
    seoErrors,
    crop,
    setCrop: changeCrop,
    isSaved,
    handleSave,
    handlePreview
  };
};
