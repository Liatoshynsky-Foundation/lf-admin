'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListSubheader,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { MouseEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './GroupContentView.styles';
import { GroupData, GroupDataField } from '~/constants/creativity';
import { EditorLanguage, LANGUAGE_OPTIONS } from '~/constants/publications';
import { GroupDetailsSection } from '~/shared/components/creativity/group/details-section/GroupDetailsSection';
import { GroupIntroSection } from '~/shared/components/creativity/group/intro-section/GroupIntroSection';
import { GroupPerformancesSection } from '~/shared/components/creativity/group/performances-section/GroupPerformancesSection';
import { GroupPhotosSection } from '~/shared/components/creativity/group/photos-section/GroupPhotosSection';
import { GroupWorksSection } from '~/shared/components/creativity/group/works-section/GroupWorksSection';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useOpusById } from '~/shared/hooks/use-opuses/useOpuses';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { OpusNumberKind, OpusStatus, useUpdateOpusMutation } from '~/types/graphql/generated/graphql';

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Partial<Record<AnchorId, HTMLButtonElement>>;

type GroupContentViewProps = Readonly<{
  id: string;
}>;

const PUBLISH_MENU_OPTIONS = [
  { id: 'PUBLISH', label: 'Опублікувати' },
  { id: 'PUBLISH_AND_EXIT', label: 'Опублікувати і вийти' },
  { id: 'DELETE', label: 'Видалити' }
];

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

const mapNumberKindToPrefix = (kind: string | null | undefined): string => {
  if (!kind) return 'Op.';

  const lowerKind = kind.toLowerCase();
  if (lowerKind === 'woo') return 'Bo.';

  return 'Op.';
};

let compositionIdCounter = 0;

const createCompositionId = (): string => {
  compositionIdCounter += 1;
  return `composition-${compositionIdCounter}`;
};

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) return '';
  const segment = url.split('/').pop() ?? url;
  return decodeURIComponent(segment.split('?')[0]);
};

export const GroupContentView = ({ id }: GroupContentViewProps) => {
  const { data, loading, error } = useOpusById(id);
  const { navigate } = useNavigationGuard();
  const searchParams = useSearchParams();

  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [anchors, setAnchors] = useState<MenuAnchor>({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [publishedTitle, setPublishedTitle] = useState({ uk: '', en: '' });
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  const [updateOpus, { loading: isSaving }] = useUpdateOpusMutation();

  useUnsavedChanges(isDirty);

  useEffect(() => {
    const fetchedOpus = data?.opusById;

    if (fetchedOpus) {
      const titleObj = {
        uk: fetchedOpus.name?.uk ?? '',
        en: fetchedOpus.name?.en ?? ''
      };
      setGroupData({
        titlePrefix: mapNumberKindToPrefix(fetchedOpus.numberKind),
        groupNumber: fetchedOpus.number ? String(fetchedOpus.number).replace(/^(op|woo|wo|bo)[.\-\s]*/i, '') : '',
        genre: fetchedOpus.genre ?? '',
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
        photos: (fetchedOpus.gallery || []).map((photo: any) => ({
          id: photo.id,
          src: photo.src || '',
          fileName: '',
          caption: { uk: photo.description?.uk || '', en: photo.description?.en || '' },
          altText: { uk: photo.altText?.uk || '', en: photo.altText?.en || '' },
          crop: photo.crop || null
        })),
        performancesTitle: fetchedOpus.performancesTitle?.uk ?? fetchedOpus.performancesTitle?.en ?? '',
        performances: (fetchedOpus.performances || []).map((perf: any) => ({
          id: perf.id,
          url: perf.videoUrl ?? '',
          caption: {
            uk: perf.title?.uk ?? '',
            en: perf.title?.en ?? ''
          }
        })),
        works: (fetchedOpus.compositions || [])
          .slice()
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
          .map((composition: any) => ({
            id: createCompositionId(),
            compositionId: composition.id,
            title: composition.title?.uk ?? composition.title?.en ?? '',
            genre: composition.genre ?? '',
            year: composition.year == null ? '' : String(composition.year),
            audios: (composition.audios ?? []).map((audio: any) => ({
              id: createCompositionId(),
              name: audio.name ?? fileNameFromUrl(audio.url),
              fileUrl: audio.url ?? undefined
            })),
            notes: (composition.sheetMusic ?? []).map((sheet: any) => ({
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

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Помилка завантаження даних
        </Typography>
        <Typography color="text.secondary">{error.message}</Typography>
      </Box>
    );
  }

  if (loading || !groupData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Завантаження...</Typography>
      </Box>
    );
  }

  const handleSave = async (statusToSave?: BaseContentStatuses) => {
    if (!groupData) return;

    let mappedStatus: OpusStatus | undefined = undefined;

    if (statusToSave === BaseContentStatuses.Published) {
      mappedStatus = OpusStatus.Published;
    } else if (statusToSave === BaseContentStatuses.Draft) {
      mappedStatus = OpusStatus.Draft;
    }

    try {
      const input = {
        numberKind: groupData.titlePrefix === 'Bo.' ? OpusNumberKind.Woo : OpusNumberKind.Op,
        number: String(groupData.groupNumber || ''),
        genre: String(groupData.genre || ''),
        additionalText: String(groupData.additionalText || ''),
        ...(mappedStatus && { status: mappedStatus }),

        name: {
          uk: String(groupData.groupTitle?.uk || ''),
          en: String(groupData.groupTitle?.en || '')
        },
        creationYear: groupData.creationYear ? String(groupData.creationYear) : null,
        endYear: groupData.endYear ? String(groupData.endYear) : null,
        datesNote: groupData.dateAdditionalText?.uk ? String(groupData.dateAdditionalText.uk) : null,

        parts: {
          uk: String(groupData.parts?.uk || ''),
          en: String(groupData.parts?.en || '')
        },

        introDescription: {
          uk: groupData.description?.uk ? JSON.stringify(groupData.description.uk) : '""',
          en: groupData.description?.en ? JSON.stringify(groupData.description.en) : '""'
        },

        compositions: (groupData.works || []).map((work, index) => ({
          id: work.compositionId,
          title: work.title.trim(),
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
          description: {
            uk: photo.caption?.uk || '',
            en: photo.caption?.en || ''
          },
          altText: {
            uk: photo.altText?.uk || '',
            en: photo.altText?.en || ''
          },
          crop: photo.crop || null
        })),

        performancesTitle: {
          uk: String(groupData.performancesTitle || ''),
          en: String(groupData.performancesTitle || '')
        },
        performances: (groupData.performances || [])
          .map((perf) => ({
            id: perf.id?.includes('-') ? undefined : perf.id,

            title: {
              uk: (perf.caption?.uk || '').trim(),
              en: (perf.caption?.en || '').trim()
            },

            videoUrl: (perf.url || '').trim()
          }))
          .filter((perf) => perf.videoUrl || perf.title.uk || perf.title.en)
      };

      await updateOpus({
        variables: {
          id: id,
          input: input
        }
      });

      toast.success('Контент успішно збережено!');
    } catch (error) {
      console.error('Помилка при збереженні контенту групи:', error);
      toast.error('Помилка при збереженні. Перевірте консоль.');
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

  const handleClose = (menuId: AnchorId) => setAnchors((prev) => ({ ...prev, [menuId]: undefined }));

  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const numberValue = String(groupData?.groupNumber || '').trim();

    if (!numberValue) {
      newErrors.groupNumber = 'Обов’язкове поле';
    } else if (!/^\d+$/.test(numberValue) || Number(numberValue) <= 0) {
      newErrors.groupNumber = 'Номер має бути цілим позитивним числом.';
    }

    if (!groupData?.groupTitle?.uk || String(groupData.groupTitle.uk).trim() === '') {
      newErrors.groupTitle = 'Обов’язкове поле';
    }

    if (!groupData?.titlePrefix || String(groupData.titlePrefix).trim() === '') {
      newErrors.titlePrefix = 'Обов’язкове поле';
    }

    if (!groupData?.creationYear || String(groupData.creationYear).trim() === '') {
      newErrors.creationYear = 'Обов’язкове поле';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: GroupDataField, value: unknown, isMultilingual = false) => {
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

        return {
          ...prev,
          [field]: {
            ...currentFieldData,
            [langKey]: value
          }
        };
      }

      return { ...prev, [field]: value };
    });
    setIsDirty(true);
  };

  const handlePublishClick = async () => {
    if (isSaving) return;
    const isValid = validate();

    if (!isValid) {
      toast.error('Заповніть усі обов’язкові поля перед публікацією.');
      setIsDetailsExpanded(true);
      return;
    }

    await handleSave(BaseContentStatuses.Published);
    setPublishedTitle(groupData.groupTitle);
    setIsDirty(false);
  };

  const handleMenuOptionClick = async (optionId: string) => {
    handleClose('publish');

    if (optionId === 'DELETE') {
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
      setTimeout(() => {
        navigate('/creativity'); 
      }, 0);
    }
    else {
      setIsInfoModalOpen(true);
    }
  };

  return (
    <Box sx={styles.container}>
      <DividedHeader
        sx={styles.header}
        originUrl="/creativity"
        onBackClick={handleBackClick}
        rightActionsComponent={
          <HeaderRightActions mode="edit" onPublish={handlePublishClick} onMenuOpen={(e) => handleOpen(e, 'publish')} />
        }
      >
        <TitleDropdown
          type="multilingual"
          language={currentLanguage}
          title={publishedTitle[langKey] || 'Редагування контенту групи'}
          onMenuOpen={(e) => handleOpen(e, 'navigation')}
        />

        <ProgressStatus isSaved={!isDirty} />
      </DividedHeader>

      <Box sx={styles.mainContent}>
        <Typography variant="body2" sx={styles.optionalContentText}>
          Заповнення контентом не є обов’язковим
        </Typography>

        <CollapsibleBlock
          title="Деталі"
          expanded={isDetailsExpanded}
          onChange={(_, isExpanded) => setIsDetailsExpanded(isExpanded)}
        >
          <GroupDetailsSection
            currentLanguage={currentLanguage}
            data={groupData}
            errors={errors}
            onChange={handleFieldChange}
          />
        </CollapsibleBlock>

        <CollapsibleBlock title="Вступна секція" defaultExpanded>
          <GroupIntroSection currentLanguage={currentLanguage} data={groupData} onChange={handleFieldChange} />
        </CollapsibleBlock>

        <CollapsibleBlock title="Фото" defaultExpanded>
          <GroupPhotosSection
            currentLanguage={currentLanguage}
            photos={groupData.photos}
            onChange={(newPhotos) => handleFieldChange('photos', newPhotos)}
          />
        </CollapsibleBlock>

        <CollapsibleBlock title="Твори" defaultExpanded>
          <GroupWorksSection works={groupData.works} onChange={(newWorks) => handleFieldChange('works', newWorks)} />
        </CollapsibleBlock>

        <CollapsibleBlock title="Всі версії виконання опису" defaultExpanded>
          <GroupPerformancesSection
            currentLanguage={currentLanguage}
            sectionTitle={groupData.performancesTitle}
            performances={groupData.performances}
            onChangeSectionTitle={(newTitle) => handleFieldChange('performancesTitle', newTitle)}
            onChangePerformances={(newPerformances) => handleFieldChange('performances', newPerformances)}
          />
        </CollapsibleBlock>
      </Box>

      <Menu
        anchorEl={anchors['navigation']}
        open={Boolean(anchors['navigation'])}
        onClose={() => handleClose('navigation')}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: styles.navigationMenuPaper
          }
        }}
      >
        <ListSubheader sx={styles.menuSubheader}>
          <Typography variant="subtitle2" color="text.secondary">
            {'Мовні версії'}
          </Typography>
        </ListSubheader>

        {LANGUAGE_OPTIONS.map(({ locale, key, label }) => (
          <MenuItem
            key={key}
            onClick={() => {
              setCurrentLanguage(locale);
              handleClose('navigation');
            }}
            sx={styles.menuItemLanguage}
          >
            <Typography variant="textMd">{label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={anchors['publish']}
        open={Boolean(anchors['publish'])}
        onClose={() => handleClose('publish')}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: styles.publishMenuPaper
          }
        }}
      >
        {PUBLISH_MENU_OPTIONS.map((action) => {
          if (action.id === 'DELETE') {
            return [
              <Divider key={`divider-${action.id}`} sx={{ my: 0.5 }} />,
              <MenuItem key={action.id} onClick={() => handleMenuOptionClick(action.id)} sx={styles.publishMenuItem}>
                <Typography variant="textMd">{action.label}</Typography>
              </MenuItem>
            ];
          }

          return (
            <MenuItem key={action.id} onClick={() => handleMenuOptionClick(action.id)} sx={styles.publishMenuItem}>
              <Typography variant="textMd">{action.label}</Typography>
            </MenuItem>
          );
        })}
      </Menu>

      <Dialog
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        disableScrollLock
        slotProps={{
          paper: {
            sx: styles.infoDialogPaper
          }
        }}
      >
        <DialogTitle sx={styles.infoDialogTitle}>Сторінка у розробці</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Ця логіка скоро буде реалізована. Наразі сторінка функціонує в режимі демонстрації на мокових даних.
          </Typography>
        </DialogContent>
        <DialogActions sx={styles.infoDialogActions}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsInfoModalOpen(false)}
            disableElevation
            sx={styles.infoDialogButton}
          >
            Зрозуміло
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
