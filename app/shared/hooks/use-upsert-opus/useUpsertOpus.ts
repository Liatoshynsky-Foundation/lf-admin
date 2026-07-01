import { useEffect, useRef, useState } from 'react';

import {
  initialOpusDetails,
  initialOpusSeoValue,
  OPUS_FIELD_LIMITS,
  OPUS_VALIDATION_MESSAGES
} from '~/constants/opus';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useCreateOpus, useOpusById, useUpdateOpus } from '~/shared/hooks/use-opuses/useOpuses';
import { CropRect } from '~/types/common';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { OpusNumberKind, OpusStatus } from '~/types/graphql/generated/graphql';
import type {
  FetchedOpusData,
  OpusCompositionData,
  OpusCompositionInput,
  OpusDetailsErrors,
  OpusDetailsValue
} from '~/types/opus';

let compositionIdCounter = 0;

export const createCompositionId = (): string => {
  compositionIdCounter += 1;

  return `composition-${compositionIdCounter}`;
};

const toCompositionInput = (composition: OpusCompositionData): OpusCompositionInput => ({
  id: composition.compositionId,
  title: composition.title.trim(),
  genre: composition.genre.trim() || undefined,
  year: composition.year.trim() || undefined,
  audios: composition.audios
    .filter((audio) => audio.name.trim())
    .map((audio) => ({ name: audio.name.trim(), fileUrl: audio.fileUrl, publishDate: audio.publishDate })),
  notes: composition.notes
    .filter((note) => note.name.trim())
    .map((note) => ({ name: note.name.trim(), fileUrl: note.fileUrl, publishDate: note.publishDate }))
});

const parseOpusNumber = (number: string): string => number.replace(/^(op|woo|wo|bo)[.\-\s]*/i, '');

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) {
    return '';
  }

  const segment = url.split('/').pop() ?? url;

  return decodeURIComponent(segment.split('?')[0]);
};

interface UseUpsertOpusProps {
  id?: string;
}

export const useUpsertOpus = ({ id }: UseUpsertOpusProps = {}) => {
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
  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialOpusSeoValue);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [forceShowErrors, setForceShowErrors] = useState(false);
  const [isSaved, setIsSaved] = useState(isEditing);

  const latestDataRef = useRef({ details, seoValue, crop });
  const isInitializedRef = useRef(false);

  const changeDetails = (value: OpusDetailsValue | ((prev: OpusDetailsValue) => OpusDetailsValue)) => {
    const next = typeof value === 'function' ? value(latestDataRef.current.details) : value;
    latestDataRef.current.details = next;
    setDetails(next);
    setIsSaved(false);

    setDetailsErrors((prev) => ({
      number: next.number.trim() ? '' : prev.number,
      name: next.name.trim() ? '' : prev.name,
      creationYear: next.creationYear.trim() ? '' : prev.creationYear
    }));
  };

  const changeSeoValue = (value: SeoBlockValue | ((prev: SeoBlockValue) => SeoBlockValue)) => {
    const next = typeof value === 'function' ? value(latestDataRef.current.seoValue) : value;
    latestDataRef.current.seoValue = next;
    setSeoValue(next);
    setIsSaved(false);
  };

  const changeCrop = (value: CropRect | null) => {
    latestDataRef.current.crop = value;
    setCrop(value);
    setIsSaved(false);
  };

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
      number: parseOpusNumber(fetched.number ?? ''),
      name: fetched.name ?? '',
      additionalText: fetched.additionalText ?? '',
      creationYear: fetched.creationYear ?? '',
      endYear: fetched.endYear ?? '',
      datesNote: fetched.datesNote ?? '',
      genre: fetched.genre ?? '',
      compositions: (fetched.compositions ?? []).map((composition) => ({
        id: createCompositionId(),
        compositionId: composition.id,
        title: composition.title?.uk ?? '',
        genre: composition.genre ?? '',
        year: composition.year != null ? String(composition.year) : '',
        audios: (composition.audios ?? []).map((audio) => ({
          id: createCompositionId(),
          name: audio.name ?? fileNameFromUrl(audio.url),
          fileUrl: audio.url ?? undefined
        })),
        notes: (composition.sheetMusic ?? []).map((sheet) => ({
          id: createCompositionId(),
          name: sheet.name ?? fileNameFromUrl(sheet.url),
          fileUrl: sheet.url ?? undefined,
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
  }, [isEditing, opusQuery.data]);

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

    return !numberError && !nameError && !creationYearError;
  };

  const handleSave = async (status: BaseContentStatuses): Promise<string | undefined> => {
    const { details: currentDetails, seoValue: currentSeo, crop: currentCrop } = latestDataRef.current;

    if (!validate(currentDetails)) {
      setForceShowErrors(true);

      return undefined;
    }

    const { uk: ukMeta, en: enMeta } = currentSeo.meta;
    const opusName = currentDetails.name.trim();

    const input = {
      numberKind: currentDetails.numberKind as unknown as OpusNumberKind,
      number: currentDetails.number.trim(),
      name: opusName,
      additionalText: currentDetails.additionalText.trim() || undefined,
      creationYear: currentDetails.creationYear.trim(),
      endYear: currentDetails.endYear.trim() || undefined,
      datesNote: currentDetails.datesNote.trim() || undefined,
      genre: currentDetails.genre.trim() || undefined,
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

    if (isEditing && id) {
      const response = await updateOpus({ id, input });
      const updatedId = response.data?.updateOpus?.id;

      if (updatedId) {
        setIsSaved(true);
      }

      return updatedId;
    }

    const response = await createOpus(input);
    const createdId = response.data?.createOpus?.id;

    if (createdId) {
      setIsSaved(true);
    }

    return createdId;
  };

  return {
    isEditing,
    isLoading: isEditing && opusQuery.loading,
    details,
    setDetails: changeDetails,
    detailsErrors,
    seoValue,
    setSeoValue: changeSeoValue,
    crop,
    setCrop: changeCrop,
    forceShowErrors,
    isSaved,
    handleSave
  };
};
