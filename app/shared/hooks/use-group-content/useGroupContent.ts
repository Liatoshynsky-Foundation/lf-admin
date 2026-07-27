import { useSearchParams } from 'next/navigation';
import { MouseEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { createCompositionId } from '../use-upsert-opus/useUpsertOpus';
import { GroupData, GroupDataField, GroupPhoto } from '~/constants/creativity';
import {
  OPUS_FIELD_LIMITS,
  OPUS_MUTATION_RESULTS,
  OPUS_VALIDATION_MESSAGES,
  REQUIRED_FIELD_ERROR
} from '~/constants/opus';
import { EditorLanguage } from '~/constants/publications';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useOpusById } from '~/shared/hooks/use-opuses/useOpuses';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  OpusNumberKind,
  OpusStatus,
  useDeleteOpusMutation,
  useUpdateOpusMutation
} from '~/types/graphql/generated/graphql';
import { FetchedOpusData, OpusCompositionSuggestion } from '~/types/opus';

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Record<AnchorId, HTMLButtonElement | null>;

type AudioItem = NonNullable<OpusCompositionSuggestion['audios']>[number];
type SheetMusicItem = NonNullable<OpusCompositionSuggestion['sheetMusic']>[number];

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

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) return '';
  const segment = url.split('/').pop() ?? url;
  return decodeURIComponent(segment.split('?')[0]);
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
  const [updateOpus, { loading: isSaving }] = useUpdateOpusMutation();

  const [deleteOpus, { loading: isDeleting }] = useDeleteOpusMutation();
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
        dateAdditionalText: {
          uk: fetchedOpus.datesNote ?? '',
          en: ''
        },
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
          audios: (composition.audios ?? []).map((audio: AudioItem) => ({
            id: createCompositionId(),
            name: audio.name ?? fileNameFromUrl(audio.url),
            fileUrl: audio.url ?? undefined
          })),
          notes: (composition.sheetMusic ?? []).map((sheet: SheetMusicItem) => ({
            id: createCompositionId(),
            name: sheet.name ?? fileNameFromUrl(sheet.url),
            fileUrl: sheet.url ?? undefined,
            publishDate: sheet.publishDate ?? ''
          }))
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
        datesNote: groupData.dateAdditionalText?.uk ? String(groupData.dateAdditionalText.uk).trim() : null,
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
            .filter((audio) => audio.name.trim())
            .map((audio) => ({
              name: audio.name.trim(),
              fileUrl: audio.fileUrl,
              publishDate: audio.publishDate
            })),
          notes: (work.notes || [])
            .filter((note) => note.name.trim())
            .map((note) => ({
              name: note.name.trim(),
              fileUrl: note.fileUrl,
              publishDate: note.publishDate
            }))
        })),
        gallery: (groupData.photos || []).map((photo) => ({
          id: photo.id?.startsWith('photo-') || photo.id?.includes('-') ? undefined : photo.id,
          src: photo.src ? String(photo.src) : '',
          description: { uk: photo.caption?.uk || '', en: photo.caption?.en || '' },
          altText: { uk: photo.altText?.uk || '', en: photo.altText?.en || '' },
          crop: photo.crop || null
        })),
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
      await updateOpus({ variables: { id, input } });
      toast.success('Групу опубліковано');
      return true;
    } catch (error) {
      console.error('Помилка при збереженні контенту групи:', error);
      toast.error('Помилка при збереженні. Перевірте консоль.');
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
      newErrors.groupTitle = OPUS_VALIDATION_MESSAGES.nameRequired;
      setCurrentLanguage('UA');
    } else if (groupTitleUk.length < OPUS_FIELD_LIMITS.name.min) {
      newErrors.groupTitle = OPUS_VALIDATION_MESSAGES.nameTooShort;
      setCurrentLanguage('UA');
    } else if (!groupTitleEn) {
      newErrors.groupTitle = OPUS_VALIDATION_MESSAGES.nameRequired;
      setCurrentLanguage('EN');
    } else if (groupTitleEn.length < OPUS_FIELD_LIMITS.name.min) {
      newErrors.groupTitle = OPUS_VALIDATION_MESSAGES.nameTooShort;
      setCurrentLanguage('EN');
    }

    if (!groupData?.titlePrefix || String(groupData.titlePrefix).trim() === '') {
      newErrors.titlePrefix = REQUIRED_FIELD_ERROR;
    }
    if (!groupData?.creationYear || String(groupData.creationYear).trim() === '') {
      newErrors.creationYear = REQUIRED_FIELD_ERROR;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      toast.error('Заповніть усі обов’язкові поля перед публікацією.');
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
      await deleteOpus({ variables: { id } });
      toast.success(OPUS_MUTATION_RESULTS.deleted);
      setIsDeleteModalOpen(false);
      navigate('/creativity');
    } catch (error) {
      console.error('Помилка при видаленні:', error);
      toast.error('Не вдалося видалити групу. Спробуйте ще раз.');
    }
  };

  const handleMenuOptionClick = async (optionId: string) => {
    handleClose('publish');
    if (optionId === 'DELETE') {
      setIsDeleteModalOpen(true);
      return;
    }

    if (!validate()) {
      toast.error('Заповніть усі обов’язкові поля перед публікацією.');
      setIsDetailsExpanded(true);
      return;
    }

    if (optionId === 'PUBLISH') {
      await handleSave(BaseContentStatuses.Published);
      setIsDirty(false);
    } else if (optionId === 'PUBLISH_AND_EXIT') {
      await handleSave(BaseContentStatuses.Published);
      setIsDirty(false);
      setTimeout(() => setShouldExitAfterSave(true), 50);
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
