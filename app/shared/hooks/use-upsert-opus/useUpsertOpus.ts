import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  COMPOSITION_DUPLICATE_ERROR,
  COMPOSITION_NAME_REQUIRED_ERROR,
  initialOpusDetails,
  initialOpusSeoValue,
  OPUS_FIELD_LIMITS,
  OPUS_MUTATION_RESULTS,
  OPUS_VALIDATION_MESSAGES
} from '~/constants/opus';
import {
  getDuplicateCompositionError,
  getDuplicateCompositionIds,
  getErrorMessage,
  getInvalidCompositionIds,
  isCompositionNameRequiredError,
  normalizeCompositionName
} from '~/lib/utils/compositionErrors';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useCreateOpus, useOpusById, useUpdateOpus } from '~/shared/hooks/use-opuses/useOpuses';
import { CropRect } from '~/types/common';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  OpusNumberKind,
  OpusStatus
} from '~/types/graphql/generated/graphql';
import type {
  FetchedOpusData,
  OpusCompositionData,
  OpusCompositionInput,
  OpusDetailsErrors,
  OpusDetailsValue
} from '~/types/opus';
import { compositionTitleSchema } from '~/validators/composition.schema';

export const createCompositionId = (): string => generateUniqueId();

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) {
    return '';
  }

  const segment = url.split('/').pop() ?? url;

  return decodeURIComponent(segment.split('?')[0]);
};

export const toCompositionInput = (
  composition: OpusCompositionData
): OpusCompositionInput => ({
  id: composition.id,
  name: composition.name.trim(),
  genre: composition.genre.trim() || undefined,
  year: composition.year.trim() || undefined,

  audios: composition.audios
    .filter((audio) => audio.name?.trim() || audio.fileUrl)
    .map((audio) => ({
      name: audio.name?.trim() || fileNameFromUrl(audio.fileUrl),
      fileUrl: audio.fileUrl
    })),

  notes: composition.notes
    .filter((note) => note.name?.trim() || note.fileUrl || note.publishDate?.trim())
    .map((note) => ({
      name: note.name?.trim() || fileNameFromUrl(note.fileUrl),
      fileUrl: note.fileUrl,
      publishDate: note.publishDate
    }))
});

interface UseUpsertOpusProps {
  id?: string;
}

export type UseUpsertOpusResult = {
  isEditing: boolean;
  isLoading: boolean;

  details: OpusDetailsValue;
  setDetails: (
    value:
      | OpusDetailsValue
      | ((prev: OpusDetailsValue) => OpusDetailsValue)
  ) => void;

  detailsErrors: OpusDetailsErrors;

  compositionErrors: Record<string, string>;

  seoValue: SeoBlockValue;
  setSeoValue: (
    value:
      | SeoBlockValue
      | ((prev: SeoBlockValue) => SeoBlockValue)
  ) => void;

  crop: CropRect | null;
  setCrop: (value: CropRect | null) => void;

  forceShowErrors: boolean;
  isSaved: boolean;

  handleSave: (
    status: BaseContentStatuses
  ) => Promise<string | undefined>;
};

export const useUpsertOpus = (
  { id }: UseUpsertOpusProps = {}
): UseUpsertOpusResult => {
  const isEditing = Boolean(id);
  const opusQuery = useOpusById(id ?? '', { skip: !isEditing });

  const [createOpus] = useCreateOpus();
  const [updateOpus] = useUpdateOpus();

  const [details, setDetails] = useState<OpusDetailsValue>(initialOpusDetails);
  const [detailsErrors, setDetailsErrors] = useState<OpusDetailsErrors>({
    number: '',
    name: '',
    creationYear: ''
  });

  const [compositionErrors, setCompositionErrors] = useState<Record<string, string>>({});

  const [seoValue, setSeoValue] =
    useState<SeoBlockValue>(initialOpusSeoValue);
    
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [forceShowErrors, setForceShowErrors] = useState(false);
  const [isSaved, setIsSaved] = useState(isEditing);

  const latestDataRef = useRef({ details, seoValue, crop });
  const isInitializedRef = useRef(false);

  const clearCompositionErrors = useCallback(() => setCompositionErrors({}), []);

  const changeDetails = useCallback((
    value:
      | OpusDetailsValue
      | ((prev: OpusDetailsValue) => OpusDetailsValue)
  ) => {
    const previousDetails = latestDataRef.current.details;

    const next =
      typeof value === 'function'
        ? value(previousDetails)
        : value;

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
  }, [clearCompositionErrors]);

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
          name: sheet.name ?? fileNameFromUrl(sheet.url),
          fileUrl: sheet.url ?? '',
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

  const validate = (value: OpusDetailsValue): boolean => {
    const number = value.number.trim();
    const name = value.name.trim();
    const creationYear = value.creationYear.trim();

    let numberError = '';

    if (!number) {
      numberError = OPUS_VALIDATION_MESSAGES.numberRequired;
    } else if (!/^\d+$/.test(number) || Number(number) <= 0) {
      numberError = OPUS_VALIDATION_MESSAGES.numberInvalid;
    }

    let nameError = '';

    if (!name) {
      nameError = OPUS_VALIDATION_MESSAGES.nameRequired;
    } else if (name.length < OPUS_FIELD_LIMITS.name.min) {
      nameError = OPUS_VALIDATION_MESSAGES.nameTooShort;
    }

    const creationYearError = creationYear ? '' : OPUS_VALIDATION_MESSAGES.creationYearRequired;

    const errors: OpusDetailsErrors = {
      number: numberError,
      name: nameError,
      creationYear: creationYearError
    };

    setDetailsErrors(errors);

    const invalidIds = getInvalidCompositionIds(value.compositions);
    const titleErrors: Record<string, string> = {};
    value.compositions.forEach((composition) => {
      const fieldPath = `compositions.${composition.id}.name`;
      const titleResult = compositionTitleSchema.safeParse(composition.name);

      if (!titleResult.success) {
        titleErrors[fieldPath] = titleResult.error.issues[0]?.message ?? '';
      }
    });
    setCompositionErrors(titleErrors);

    const duplicateIds = getDuplicateCompositionIds(value.compositions);
    if (duplicateIds.length > 0) {
      toast.error(COMPOSITION_DUPLICATE_ERROR);
    }

    if (invalidIds.length > 0) {
      toast.error( COMPOSITION_NAME_REQUIRED_ERROR);
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

  const handleMutationError = (
    error: unknown
  ): void => {
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
      setCompositionErrors(
        Object.fromEntries(invalidIds.map((id) => [`compositions.${id}.name`, '']))
      );

      toast.error(COMPOSITION_NAME_REQUIRED_ERROR);
      return;
    }

    toast.error(message);
  };

  const handleSave = async (status: BaseContentStatuses): Promise<string | undefined> => {
    const { details: currentDetails, seoValue: currentSeo, crop: currentCrop } = latestDataRef.current;

    if (!validate(currentDetails)) {
      setForceShowErrors(true);

      return undefined;
    }

    clearCompositionErrors();

    const { uk: ukMeta, en: enMeta } = currentSeo.meta;
    const opusName = currentDetails.name.trim();
    const input = {
      numberKind: currentDetails.numberKind as unknown as OpusNumberKind,
      number: Number(currentDetails.number.trim()),
      name: { 
        uk: opusName, 
        en: opusName 
      },
      additionalText: currentDetails.additionalText.trim() || undefined,
      creationYear: currentDetails.creationYear.trim(),
      endYear: currentDetails.endYear.trim() || undefined,
      datesNote: currentDetails.datesNote.trim() || undefined,
      genre: {
        uk: currentDetails.genre.trim() || undefined,
        en: currentDetails.genre.trim() || undefined
      },
      compositions: currentDetails.compositions.map(toCompositionInput),
      adminTitle: opusName,
      title: { uk: ukMeta.title.trim() || opusName, en: enMeta.title.trim() || opusName },
      description: { uk: ukMeta.description.trim(), en: enMeta.description.trim() },
      keywords: { uk: ukMeta.keywords.trim(), en: enMeta.keywords.trim() },
      allowIndexation: { uk: currentSeo.allowIndexing.uk, en: currentSeo.allowIndexing.en },
      coverImage: {
        src: currentSeo.ogImage || opusName,
        alt: { uk: ukMeta.altText?.uk || opusName, en: enMeta.altText?.en || opusName },
        caption: { uk: opusName, en: opusName },
        ...(currentCrop && { crop: currentCrop })
      },
      status: status as unknown as OpusStatus,
      publishedAt: status === BaseContentStatuses.Published ? new Date().toISOString() : undefined
    };


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
        toast.error(
          isEditing
            ? OPUS_MUTATION_RESULTS.updateFailed
            : OPUS_MUTATION_RESULTS.createFailed
        );
        return undefined;
      }

      setIsSaved(true);

      toast.success(
        isEditing
          ? OPUS_MUTATION_RESULTS.updated
          : OPUS_MUTATION_RESULTS.created
      );
      return savedId;
    } catch (error) {
      handleMutationError(error);
      return undefined;
    }
  };

  return {
    isEditing,
    isLoading: isEditing && opusQuery.loading,
    details,
    setDetails: changeDetails,
    detailsErrors,
    compositionErrors,
    seoValue,
    setSeoValue: changeSeoValue,
    crop,
    setCrop: changeCrop,
    forceShowErrors,
    isSaved,
    handleSave
  };
};
