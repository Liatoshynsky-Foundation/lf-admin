import { useSearchParams } from 'next/navigation';
import { MouseEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { createCompositionId } from '../use-upsert-opus/useUpsertOpus';
import { isMediaItemFilled, mapMediaItemFromApi, resolveMediaName } from './compositionMedia';
import { GroupData, GroupDataField, GroupPhoto } from '~/constants/creativity';
import {
  COMPOSITION_DUPLICATE_ERROR,
  COMPOSITION_NAME_REQUIRED_ERROR,
  COMPOSITION_REQUIRED_FIELDS_ERROR,
  OPUS_FIELD_LIMITS,
  OPUS_MUTATION_RESULTS,
  OPUS_VALIDATION_MESSAGES,
  REQUIRED_FIELD_ERROR
} from '~/constants/opus';
import { EditorLanguage } from '~/constants/publications';
import {
  getDuplicateCompositionError,
  getDuplicateCompositionIds,
  getInvalidCompositionIds,
  isCompositionNameRequiredError,
  normalizeCompositionName
} from '~/lib/utils/compositionErrors';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useDeleteOpus, useOpusById, useUpdateOpus } from '~/shared/hooks/use-opuses/useOpuses';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  OpusNumberKind,
  OpusStatus
} from '~/types/graphql/generated/graphql';
import { FetchedOpusData } from '~/types/opus';

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Record<AnchorId, HTMLButtonElement | null>;

const parseDescription = (desc: unknown): Record<string, unknown> => {
  if (!desc) return { type: 'doc', content: [] };
  if (typeof desc === 'object') return desc as Record<string, unknown>;
  if (typeof desc === 'string') {
    try {
      return JSON.parse(desc);
    } catch {
      return {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: desc }] }]
      };
    }
  }
  return { type: 'doc', content: [] };
};

const validatePerformance = (
  perf: NonNullable<GroupData['performances']>[number],
  newErrors: Record<string, string>,
  setCurrentLanguage: (lang: EditorLanguage) => void
) => {
  const url = (perf.url || '').trim();
  const capUk = (perf.caption?.uk || '').trim();
  const capEn = (perf.caption?.en || '').trim();

  const isRowEmpty = !url && !capUk && !capEn;
  if (isRowEmpty) return;

  if (!url) {
    newErrors[`performances[${perf.id}].url`] = OPUS_VALIDATION_MESSAGES.performanceUrl;
  }

  if (!capUk || capUk.length < OPUS_FIELD_LIMITS.caption.min || capUk.length > OPUS_FIELD_LIMITS.caption.max) {
    if (!capUk) {
      newErrors[`performances[${perf.id}].caption.uk`] = OPUS_VALIDATION_MESSAGES.performanceSignature;
    } else if (capUk.length > OPUS_FIELD_LIMITS.caption.max) {
      newErrors[`performances[${perf.id}].caption.uk`] = OPUS_VALIDATION_MESSAGES.captionTooLong;
    } else {
      newErrors[`performances[${perf.id}].caption.uk`] = OPUS_VALIDATION_MESSAGES.nameTooShort;
    }
    setCurrentLanguage('UA');
  } else if (!capEn || capEn.length < OPUS_FIELD_LIMITS.caption.min || capEn.length > OPUS_FIELD_LIMITS.caption.max) {
    if (!capEn) {
      newErrors[`performances[${perf.id}].caption.en`] = OPUS_VALIDATION_MESSAGES.performanceSignature;
    } else if (capEn.length > OPUS_FIELD_LIMITS.caption.max) {
      newErrors[`performances[${perf.id}].caption.en`] = OPUS_VALIDATION_MESSAGES.captionTooLong;
    } else {
      newErrors[`performances[${perf.id}].caption.en`] = OPUS_VALIDATION_MESSAGES.nameTooShort;
    }
    setCurrentLanguage('EN');
  }
};

const validatePhotoAltText = (
  photo: GroupPhoto,
  newErrors: Record<string, string>,
  setCurrentLanguage: (lang: EditorLanguage) => void
) => {
  const altUk = (photo.altText?.uk || '').trim();
  const altEn = (photo.altText?.en || '').trim();

  if (!altUk) {
    newErrors[`photos[${photo.id}].altText.uk`] = OPUS_VALIDATION_MESSAGES.photoAltText;
    setCurrentLanguage('UA');
  } else if (altUk.length > OPUS_FIELD_LIMITS.altText.max) {
    newErrors[`photos[${photo.id}].altText.uk`] = OPUS_VALIDATION_MESSAGES.captionTooLong;
    setCurrentLanguage('UA');
  } else if (altUk.length < OPUS_FIELD_LIMITS.altText.min) {
    newErrors[`photos[${photo.id}].altText.uk`] = OPUS_VALIDATION_MESSAGES.photoTextTooShort;
    setCurrentLanguage('UA');
  } else if (!altEn) {
    newErrors[`photos[${photo.id}].altText.en`] = OPUS_VALIDATION_MESSAGES.photoAltText;
    setCurrentLanguage('EN');
  } else if (altEn.length > OPUS_FIELD_LIMITS.altText.max) {
    newErrors[`photos[${photo.id}].altText.en`] = OPUS_VALIDATION_MESSAGES.captionTooLong;
    setCurrentLanguage('EN');
  } else if (altEn.length < OPUS_FIELD_LIMITS.altText.min) {
    newErrors[`photos[${photo.id}].altText.en`] = OPUS_VALIDATION_MESSAGES.photoTextTooShort;
    setCurrentLanguage('EN');
  }
};

const validatePhotoCaption = (
  photo: GroupPhoto,
  newErrors: Record<string, string>,
  setCurrentLanguage: (lang: EditorLanguage) => void
) => {
  const capUk = (photo.caption?.uk || '').trim();
  const capEn = (photo.caption?.en || '').trim();

  if (capUk.length > OPUS_FIELD_LIMITS.caption.max) {
    newErrors[`photos[${photo.id}].caption.uk`] = OPUS_VALIDATION_MESSAGES.captionTooLong;
    setCurrentLanguage('UA');
  } else if (capUk.length > 0 && capUk.length < OPUS_FIELD_LIMITS.caption.min) {
    newErrors[`photos[${photo.id}].caption.uk`] = OPUS_VALIDATION_MESSAGES.photoTextTooShort;
    setCurrentLanguage('UA');
  } else if (capEn.length > OPUS_FIELD_LIMITS.caption.max) {
    newErrors[`photos[${photo.id}].caption.en`] = OPUS_VALIDATION_MESSAGES.captionTooLong;
    setCurrentLanguage('EN');
  } else if (capEn.length > 0 && capEn.length < OPUS_FIELD_LIMITS.caption.min) {
    newErrors[`photos[${photo.id}].caption.en`] = OPUS_VALIDATION_MESSAGES.photoTextTooShort;
    setCurrentLanguage('EN');
  }
};

const validatePhoto = (
  photo: GroupPhoto,
  newErrors: Record<string, string>,
  setCurrentLanguage: (lang: EditorLanguage) => void
) => {
  const src = (photo.src || '').trim();
  if (!src) return;

  validatePhotoAltText(photo, newErrors, setCurrentLanguage);
  validatePhotoCaption(photo, newErrors, setCurrentLanguage);
};

export const useGroupContent = (id: string) => {
  const { data, loading, error } = useOpusById(id);
  const { navigate } = useNavigationGuard();
  const searchParams = useSearchParams();

  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [anchors, setAnchors] = useState<MenuAnchor>({
    navigation: null,
    publish: null
  });
  const [publishedTitle, setPublishedTitle] = useState({ uk: '', en: '' });
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [shouldExitAfterSave, setShouldExitAfterSave] = useState(false);
  const [updateOpus, { loading: isSaving }] = useUpdateOpus();

  const [deleteOpus, { loading: isDeleting }] = useDeleteOpus();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useUnsavedChanges(isDirty && !shouldExitAfterSave);

  useEffect(() => {
    if (shouldExitAfterSave) {
      navigate('/creativity');
    }
  }, [shouldExitAfterSave, navigate]);

  useEffect(() => {
    const fetchedOpus = data?.opusById as FetchedOpusData | undefined;

    if (fetchedOpus) {
      const titleObj = {
        uk: fetchedOpus.name?.uk ?? '',
        en: fetchedOpus.name?.en ?? ''
      };
      setGroupData({
        titlePrefix: fetchedOpus.numberKind ?? 'op',
        groupNumber: fetchedOpus.number
          ? String(fetchedOpus.number).replace(/^(op|woo|sineop|wo|bo)[.\-\s]*/i, '')
          : '',
        genre: {
          uk: fetchedOpus.genre?.uk ?? '',
          en: fetchedOpus.genre?.en ?? ''
        },
        additionalText: fetchedOpus.additionalText ?? '',
        groupTitle: {
          uk: fetchedOpus.name?.uk ?? '',
          en: fetchedOpus.name?.en ?? ''
        },
        creationYear: fetchedOpus.creationYear ? String(fetchedOpus.creationYear) : '',
        endYear: fetchedOpus.endYear ? String(fetchedOpus.endYear) : '',
        dateAdditionalText: fetchedOpus.datesNote ?? '',
        status: fetchedOpus.status || 'draft',
        parts: {
          uk: fetchedOpus.parts?.uk ?? '',
          en: fetchedOpus.parts?.en ?? ''
        },
        description: {
          uk: parseDescription(fetchedOpus.introDescription?.uk),
          en: parseDescription(fetchedOpus.introDescription?.en)
        },
        blocksOrder: fetchedOpus.blocksOrder?.length
          ? fetchedOpus.blocksOrder
          : ['details', 'intro', 'photos', 'works', 'performances'],
        photos: (fetchedOpus.gallery || []).map((photo) => {
          const mappedCrop = photo.crop
            ? ({
              x: photo.crop.x ?? 0,
              y: photo.crop.y ?? 0,
              width: photo.crop.width ?? 0,
              height: photo.crop.height ?? 0,
              rect: {
                x: photo.crop.x ?? 0,
                y: photo.crop.y ?? 0,
                width: photo.crop.width ?? 0,
                height: photo.crop.height ?? 0
              }
            } as unknown as GroupPhoto['crop'])
            : null;

          return {
            id: photo.id,
            src: photo.src || '',
            fileName: '',
            caption: { uk: photo.description?.uk || '', en: photo.description?.en || '' },
            altText: { uk: photo.altText?.uk || '', en: photo.altText?.en || '' },
            crop: mappedCrop
          };
        }),
        performancesTitle: fetchedOpus.performancesTitle?.uk ?? fetchedOpus.performancesTitle?.en ?? '',
        performances: (fetchedOpus.performances || []).map((perf) => ({
          id: perf.id,
          url: perf.videoUrl ?? '',
          caption: {
            uk: perf.title?.uk ?? '',
            en: perf.title?.en ?? ''
          }
        })),
        compositions: (fetchedOpus.compositions || []).map((composition) => ({
          id: composition.id,
          name: composition.name?.uk ?? composition.name?.en ?? '',
          genre: composition.genre ?? '',
          year: composition.year == null ? '' : String(composition.year),
          audios: (composition.audios ?? []).map((audio) =>
            mapMediaItemFromApi(audio as { name?: string | null; url?: string | null }, createCompositionId)
          ),
          notes: (composition.sheetMusic ?? []).map((sheet) =>
            mapMediaItemFromApi(
                sheet as { name?: string | null; url?: string | null; publishDate?: string | null },
                createCompositionId
            )
          )
        }))
      });
      setPublishedTitle(titleObj);
    }
  }, [data]);

  const handleSave = async (statusToSave?: BaseContentStatuses) => {
    if (!groupData) return;
    let mappedStatus: OpusStatus | undefined = undefined;
    if (statusToSave === BaseContentStatuses.Published) {
      mappedStatus = OpusStatus.Published;
    }
    try {
      const input = {
        number: Number(groupData.groupNumber.trim()),
        numberKind: groupData.titlePrefix as unknown as OpusNumberKind,
        genre: {
          uk: String(groupData.genre?.uk || '').trim(),
          en: String(groupData.genre?.en || '').trim()
        },
        additionalText: String(groupData.additionalText || '').trim() || '',
        ...(mappedStatus && { status: mappedStatus }),
        name: {
          uk: String(groupData.groupTitle?.uk || ''),
          en: String(groupData.groupTitle?.en || '')
        },
        creationYear: String(groupData.creationYear || '').trim(),
        endYear: groupData.endYear ? String(groupData.endYear) : null,
        datesNote: groupData.dateAdditionalText ? String(groupData.dateAdditionalText).trim() : null,
        parts: {
          uk: String(groupData.parts?.uk || ''),
          en: String(groupData.parts?.en || '')
        },
        introDescription: {
          uk: groupData.description?.uk ? JSON.stringify(groupData.description.uk) : '""',
          en: groupData.description?.en ? JSON.stringify(groupData.description.en) : '""'
        },
        blocksOrder: groupData.blocksOrder || ['details', 'intro', 'photos', 'works', 'performances'],
        compositions: (groupData.compositions || []).map((work, index) => ({
          id: work.id,
          name: work.name.trim(),
          genre: work.genre.trim() || undefined,
          year: work.year.trim() || undefined,
          order: index + 1,
          audios: (work.audios || [])
            .filter(isMediaItemFilled)
            .map((audio) => ({
              name: resolveMediaName(audio),
              fileUrl: audio.fileUrl,
              publishDate: ''
            })),
          notes: (work.notes || [])
            .filter(isMediaItemFilled)
            .map((note) => ({
              name: resolveMediaName(note),
              fileUrl: note.fileUrl ? note.fileUrl : null,
              publishDate: note.publishDate || ''
            }))
        })),
        gallery: (groupData.photos || []).map((photo) => {
          const cropData = photo.crop as {
            rect?: { x: number; y: number; width: number; height: number };
            x?: number;
            y?: number;
            width?: number;
            height?: number;
          } | null;

          const mappedCrop = cropData
            ? {
              x: cropData.rect?.x ?? cropData.x ?? 0,
              y: cropData.rect?.y ?? cropData.y ?? 0,
              width: cropData.rect?.width ?? cropData.width ?? 0,
              height: cropData.rect?.height ?? cropData.height ?? 0
            }
            : null;

          return {
            id: photo.id?.startsWith('photo-') || photo.id?.includes('-') ? undefined : photo.id,
            src: photo.src ? String(photo.src) : '',
            description: {
              uk: (photo.caption?.uk || '').trim(),
              en: (photo.caption?.en || '').trim()
            },
            altText: {
              uk: (photo.altText?.uk || '').trim(),
              en: (photo.altText?.en || '').trim()
            },
            crop: mappedCrop
          };
        }),
        performancesTitle: {
          uk: String(groupData.performancesTitle || ''),
          en: String(groupData.performancesTitle || '')
        },
        performances: (groupData.performances || [])
          .map((perf) => ({
            id: perf.id?.includes('-') ? undefined : perf.id,
            title: { uk: (perf.caption?.uk || '').trim(), en: (perf.caption?.en || '').trim() },
            videoUrl: (perf.url || '').trim()
          }))
          .filter((perf) => perf.videoUrl || perf.title.uk || perf.title.en)
      };
      await updateOpus({ id, input });
      toast.success('Групу опубліковано');
      return true;
    } catch (error) {
      const duplicateError = getDuplicateCompositionError(error);
      if (duplicateError) {
        const duplicateErrors = Object.fromEntries(
          (groupData.compositions || [])
            .filter((composition) => normalizeCompositionName(composition.name) === duplicateError.name)
            .map((composition) => [`compositions.${composition.id}.name`, duplicateError.message])
        );
        setErrors((previous) => ({ ...previous, ...duplicateErrors }));
        toast.error(duplicateError.message);
        return false;
      }
      if (isCompositionNameRequiredError(error)) {
        const requiredNameErrors = Object.fromEntries(
          getInvalidCompositionIds(groupData.compositions || []).map((id) => [`compositions.${id}.name`, ''])
        );
        setErrors((previous) => ({ ...previous, ...requiredNameErrors }));
        toast.error(COMPOSITION_NAME_REQUIRED_ERROR);
        return false;
      }
      toast.error(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const handleBackClick = () => {
    const from = searchParams?.get('from');
    if (from === 'create' || from === 'edit') {
      navigate(`/creativity/group/${id}/edit`);
    } else {
      navigate('/creativity');
    }
  };

  const handleOpen = (event: MouseEvent<HTMLElement>, menuId: AnchorId) =>
    setAnchors((prev) => ({ ...prev, [menuId]: event.currentTarget as HTMLButtonElement }));

  const handleClose = (menuId: AnchorId) => setAnchors((prev) => ({ ...prev, [menuId]: null }));

  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const numberValue = String(groupData?.groupNumber || '').trim();

    if (!numberValue) {
      newErrors.groupNumber = REQUIRED_FIELD_ERROR;
    } else if (!/^\d+$/.test(numberValue) || Number(numberValue) <= 0) {
      newErrors.groupNumber = OPUS_VALIDATION_MESSAGES.numberInvalid;
    }

    const groupTitleUk = String(groupData?.groupTitle?.uk || '').trim();
    const groupTitleEn = String(groupData?.groupTitle?.en || '').trim();

    if (!groupTitleUk) {
      newErrors['groupTitle.uk'] = OPUS_VALIDATION_MESSAGES.nameRequired;
      setCurrentLanguage('UA');
    } else if (groupTitleUk.length < OPUS_FIELD_LIMITS.name.min) {
      newErrors['groupTitle.uk'] = OPUS_VALIDATION_MESSAGES.nameTooShort;
      setCurrentLanguage('UA');
    } else if (!groupTitleEn) {
      newErrors['groupTitle.en'] = OPUS_VALIDATION_MESSAGES.nameRequired;
      setCurrentLanguage('EN');
    } else if (groupTitleEn.length < OPUS_FIELD_LIMITS.name.min) {
      newErrors['groupTitle.en'] = OPUS_VALIDATION_MESSAGES.nameTooShort;
      setCurrentLanguage('EN');
    }

    groupData?.performances?.forEach((perf) => validatePerformance(perf, newErrors, setCurrentLanguage));
    groupData?.photos?.forEach((photo) => validatePhoto(photo, newErrors, setCurrentLanguage));

    if (!groupData?.titlePrefix || String(groupData.titlePrefix).trim() === '') {
      newErrors.titlePrefix = REQUIRED_FIELD_ERROR;
    }
    if (!groupData?.creationYear || String(groupData.creationYear).trim() === '') {
      newErrors.creationYear = REQUIRED_FIELD_ERROR;
    }

    const emptyCompositionIds = getInvalidCompositionIds(groupData?.compositions || []);
    emptyCompositionIds.forEach((id) => {
      newErrors[`compositions.${id}.name`] = '';
    });

    const hasDuplicateCompositionNames = getDuplicateCompositionIds(groupData?.compositions || []).length > 0;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !hasDuplicateCompositionNames;
  };

  const handleFieldChange = (field: GroupDataField | 'blocksOrder', value: unknown, isMultilingual = false) => {
    if (shouldExitAfterSave) return;
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }

    if (field === 'compositions') {
      setErrors((previous) =>
        Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith('compositions.')))
      );
    }

    setGroupData((prev) => {
      if (!prev) return null;
      if (isMultilingual) {
        const currentFieldData =
          prev[field] && typeof prev[field] === 'object' ? (prev[field] as Record<string, unknown>) : {};
        return { ...prev, [field]: { ...currentFieldData, [langKey]: value } };
      }
      return { ...prev, [field]: value };
    });
    setIsDirty(true);
  };

  const handlePublishClick = async () => {
    if (isSaving) return;
    if (!validate()) {
      if (getDuplicateCompositionIds(groupData?.compositions || []).length > 0) {
        toast.error(COMPOSITION_DUPLICATE_ERROR);
        setIsDetailsExpanded(true);
        return;
      }
      if (groupData?.compositions.some((composition) => !composition.name.trim())) {
        toast.error(COMPOSITION_NAME_REQUIRED_ERROR);
        setIsDetailsExpanded(true);
        return;
      }
      toast.error(COMPOSITION_REQUIRED_FIELDS_ERROR);
      setIsDetailsExpanded(true);
      return;
    }
    const isSuccess = await handleSave(BaseContentStatuses.Published);
    if (isSuccess) {
      setPublishedTitle(groupData!.groupTitle);
      setIsDirty(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteOpus({ id });
      toast.success(OPUS_MUTATION_RESULTS.deleted);
      setIsDeleteModalOpen(false);
      navigate('/creativity');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleMenuOptionClick = async (optionId: string) => {
    handleClose('publish');
    if (optionId === 'DELETE') {
      setIsDeleteModalOpen(true);
      return;
    }

    if (!validate()) {
      if (getDuplicateCompositionIds(groupData?.compositions || []).length > 0) {
        toast.error(COMPOSITION_DUPLICATE_ERROR);
        setIsDetailsExpanded(true);
        return;
      }
      if (groupData?.compositions.some((composition) => !composition.name.trim())) {
        toast.error(COMPOSITION_NAME_REQUIRED_ERROR);
        setIsDetailsExpanded(true);
        return;
      }
      toast.error(COMPOSITION_REQUIRED_FIELDS_ERROR);
      setIsDetailsExpanded(true);
      return;
    }

    if (optionId === 'PUBLISH') {
      const isSuccess = await handleSave(BaseContentStatuses.Published);
      if (isSuccess) setIsDirty(false);
    } else if (optionId === 'PUBLISH_AND_EXIT') {
      const isSuccess = await handleSave(BaseContentStatuses.Published);
      if (isSuccess) {
        setIsDirty(false);
        setTimeout(() => setShouldExitAfterSave(true), 50);
      }
    }
  };

  return {
    loading,
    error,
    groupData,
    isDirty,
    currentLanguage,
    errors,
    anchors,
    publishedTitle,
    isDetailsExpanded,
    langKey,
    setCurrentLanguage,
    setIsDetailsExpanded,
    handleBackClick,
    handleOpen,
    handleClose,
    handleFieldChange,
    handlePublishClick,
    handleMenuOptionClick,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleConfirmDelete,
    isDeleting
  };
};
