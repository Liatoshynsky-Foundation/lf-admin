'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListSubheader,
  Menu,
  MenuItem,
  Typography} from '@mui/material';
import { MouseEvent, useState } from 'react';

import { OpusDetailsSection } from './components/OpusDetailsSection';
import { OpusIntroSection } from './components/OpusIntroSection';
import { OpusPerformancesSection } from './components/OpusPerformancesSection';
import { OpusPhotosSection } from './components/OpusPhotosSection';
import { OpusWorksSection } from './components/OpusWorksSection';
import { styles } from './EditOpusView.styles';
import { EditorLanguage, LANGUAGE_OPTIONS } from '~/constants/publications';
import Badge from '~/shared/components/badge/Badge';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Partial<Record<AnchorId, HTMLButtonElement>>;

type EditOpusViewProps = Readonly<{
  id: string;
}>;

const PUBLISH_MENU_OPTIONS = [
  { id: 'SAVE_CHANGES', label: 'Зберегти зміни' },
  { id: 'SAVE_AND_EXIT', label: 'Зберегти зміни і вийти' },
  { id: 'DELETE_DRAFT', label: 'Видалити чернетку' }
];

const mockAvailableWorks = [
  { id: 'free-1', title: 'Соната №2 для фортепіано', genre: { uk: 'Соната', en: 'Sonata' } },
  { id: 'free-2', title: 'Симфонія №4', genre: { uk: 'Симфонія', en: 'Symphony' } },
  { id: 'free-3', title: 'Прелюдія до мінор', genre: { uk: 'Прелюдія', en: 'Prelude' } },
  { id: 'free-4', title: 'Український квінтет (вільний запис)', genre: { uk: 'Квінтет', en: 'Quintet' } }
];

export const EditOpusView = ({ id: _id }: EditOpusViewProps) => {
  const [opusData, setOpusData] = useState({
    titlePrefix: 'Op.',
    opusNumber: '42',
    additionalText: 'bis',
    opusTitle: {
      uk: 'Перший струнний квартет (d moll)',
      en: 'First String Quartet (d minor)'
    },
    creationDate: '1922',

    parts: {
      uk: 'I. Allegro e poco agitato \nII. Lento e tranquillo \nIII. Allegro \nIV. Allegro risoluto',
      en: 'I. Allegro e poco agitato \nII. Lento e tranquillo \nIII. Allegro \nIV. Allegro risoluto'
    },
    description: {
      uk: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Лібрето опери за мотивами історичної повісті Івана Франка «Захар Беркут» уклав драматург, критик та теоретик театру Яків Мамонтов. Твір написаний на замовлення Народного комісаріату освіти України. Опера має три редакції: перша українська редакція (1929), московська редакція (1930, існує лише в клавірі, ніколи не була виконана), друга українська редакція (середина 1960-х років, є скороченим варіантом першої української редакції).'
              }
            ]
          }
        ]
      } as Record<string, unknown>,
      en: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'The libretto of the opera, based on the historical story of Ivan Franko\'s "Zahar Berkut", was written by the dramatist, critic, and theater theorist Yakiv Mamontov. The work was written on order of the People\'s Commissariat of Education of Ukraine. The opera has three versions: the first Ukrainian version (1929), the Moscow version (1930, exists only in harpsichord arrangement, was never performed), and the second Ukrainian version (mid-1960s, is a shortened version of the first Ukrainian version).'
              }
            ]
          }
        ]
      } as Record<string, unknown>
    },
    photos: [
      {
        id: 'mock-photo-1',
        src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/about-us-gomon.png',
        fileName: 'original_score_1922.jpg',
        caption: 'Прим’єра опери “Золотий обруч” у Львові 2025',
        altText: 'Назва файлу зображення',
        crop: null
      },
      {
        id: 'mock-photo-2',
        src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/1781613623635-fb2403f5d3c5eb47.png',
        fileName: 'quartet_performance.png',
        caption: 'Прим’єра опери “Золотий обруч” у Львові 2025',
        altText: 'Назва файлу зображення',
        crop: null
      }
    ],
    works: [
      {
        id: 'mock-work-1',
        title: '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи',
        genre: { uk: 'Романс', en: 'Romance' }
      },
      {
        id: 'mock-work-2',
        title: '№2«Смерть», сл. І. Буніна, укр.пер. М. Стріхи',
        genre: { uk: 'Романс', en: 'Romance' }
      },
      {
        id: 'mock-work-3',
        title: '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи',
        genre: { uk: 'Пісня', en: 'Song' }
      }
    ],
    performancesTitle: 'Версії виконання опери "Золотий обруч"',
    performances: [
      {
        id: 'mock-perf-1',
        url: 'https://www.youtube.com/watch?v=decree_classic',
        caption: 'Запис фіналу опери у виконанні хору та оркестру Київської опери (1975 р.)'
      },
      {
        id: 'mock-perf-2',
        url: 'https://www.youtube.com/watch?v=modern_version',
        caption: 'Симфонічна сюїта на теми з опери, Львівська національна філармонія (2024 р.)'
      }
    ],
    status: 'draft'
  });

  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChanges(isDirty);
  const { navigate } = useNavigationGuard();

  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [anchors, setAnchors] = useState<MenuAnchor>({});

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleOpen = (event: MouseEvent<HTMLElement>, menuId: AnchorId) =>
    setAnchors((prev) => ({ ...prev, [menuId]: event.currentTarget as HTMLButtonElement }));

  const handleClose = (menuId: AnchorId) => setAnchors((prev) => ({ ...prev, [menuId]: undefined }));

  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';
  const derivedGenres = Array.from(new Set(opusData.works.map((w) => w.genre?.[langKey]).filter(Boolean))).join(', ');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!opusData.titlePrefix) {
      newErrors.titlePrefix = 'Оберіть тип';
    }
    if (!opusData.opusNumber || opusData.opusNumber.toString().trim() === '') {
      newErrors.opusNumber = 'Обов’язкове поле';
    }
    if (!opusData.opusTitle[langKey] || opusData.opusTitle[langKey].trim() === '') {
      newErrors.opusTitle = 'Обов’язкове поле';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: unknown, isMultilingual = false) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    setOpusData((prev) => {
      if (isMultilingual) {
        const langKey = currentLanguage === 'UA' ? 'uk' : 'en';
        return {
          ...prev,
          [field]: {
            ...(prev[field as keyof typeof prev] as object),
            [langKey]: value
          }
        };
      }

      return { ...prev, [field]: value };
    });
    setIsDirty(true);
  };

  const handlePublishClick = () => {
    if (!validate()) return;
    setIsInfoModalOpen(true);
  };

  const handleMenuOptionClick = (optionId: string) => {
    handleClose('publish');
    if (optionId !== 'DELETE_DRAFT' && !validate()) return;
    setIsInfoModalOpen(true);
  };

  return (
    <Box sx={styles.container}>
      <DividedHeader
        sx={styles.header}
        originUrl="/creativity"
        onBackClick={() => navigate('/creativity')}
        rightActionsComponent={
          <HeaderRightActions
            mode="edit"
            disabled={!isDirty}
            onPublish={handlePublishClick}
            onMenuOpen={(e) => handleOpen(e, 'publish')}
          />
        }
      >
        <TitleDropdown
          type="multilingual"
          language={currentLanguage}
          title={opusData.opusTitle[currentLanguage === 'UA' ? 'uk' : 'en'] || 'Редагування опусу'}
          onMenuOpen={(e) => handleOpen(e, 'navigation')}
        />

        <Badge variant={opusData.status as 'draft' | 'published'} />

        <ProgressStatus isSaved={!isDirty} />
      </DividedHeader>

      <Box sx={styles.mainContent}>
        <Typography
          variant="body2"
          sx={{
            color: '#696C7D',
            fontStyle: 'italic'
          }}
        >
          Заповнення контентом не є обов’язковим
        </Typography>

        <OpusDetailsSection
          currentLanguage={currentLanguage}
          data={opusData}
          derivedGenre={derivedGenres}
          errors={errors}
          onChange={handleFieldChange}
        />
        <OpusIntroSection currentLanguage={currentLanguage} data={opusData} onChange={handleFieldChange} />

        <OpusPhotosSection photos={opusData.photos} onChange={(newPhotos) => handleFieldChange('photos', newPhotos)} />

        <OpusWorksSection
          works={opusData.works}
          availableWorks={mockAvailableWorks}
          onChange={(newWorks) => handleFieldChange('works', newWorks)}
        />

        <OpusPerformancesSection
          sectionTitle={opusData.performancesTitle}
          performances={opusData.performances}
          onChangeSectionTitle={(newTitle) => handleFieldChange('performancesTitle', newTitle)}
          onChangePerformances={(newPerformances) => handleFieldChange('performances', newPerformances)}
        />
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
            sx: {
              mt: '8px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              border: '1px solid #E0E2E8'
            }
          }
        }}
      >
        <ListSubheader sx={{ height: 32, display: 'flex', alignItems: 'center', bgcolor: 'transparent' }}>
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
            sx={{
              minWidth: 160,
              py: '10px',
              px: '16px'
            }}
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
            sx: {
              mt: '8px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              border: '1px solid #E0E2E8',
              minWidth: 220
            }
          }
        }}
      >
        {PUBLISH_MENU_OPTIONS.map((action) => (
          <MenuItem key={action.id} onClick={() => handleMenuOptionClick(action.id)} sx={{ py: '10px', px: '16px' }}>
            <Typography variant="textMd" sx={{ color: action.id === 'DELETE_DRAFT' ? 'error.main' : 'text.primary' }}>
              {action.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        disableScrollLock
        slotProps={{
          paper: {
            sx: { borderRadius: '12px', p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Сторінка у розробці</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Ця логіка скоро буде реалізована. Наразі сторінка функціонує в режимі демонстрації на мокових
            даних.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsInfoModalOpen(false)}
            disableElevation
            sx={{ borderRadius: '8px' }}
          >
            Зрозуміло
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
