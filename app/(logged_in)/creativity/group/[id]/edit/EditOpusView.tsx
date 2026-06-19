'use client';

import { Box, ListSubheader, Menu, MenuItem, Typography } from '@mui/material';
import { MouseEvent,useState } from 'react';

import { OpusDetailsSection } from './components/OpusDetailsSection';
import { OpusIntroSection } from './components/OpusIntroSection';
import { OpusPhotosSection } from './components/OpusPhotosSection';
import { OpusWorksSection } from './components/OpusWorksSection';
import { styles } from './EditOpusView.styles';
import { EditorLanguage, LANGUAGE_OPTIONS } from '~/constants/publications';
import Badge from '~/shared/components/badge/Badge';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Partial<Record<AnchorId, HTMLButtonElement>>;

type EditOpusViewProps = Readonly<{
  id: string;
}>;

export const EditOpusView = ({ id }: EditOpusViewProps) => {
  const [opusData, setOpusData] = useState({
    titlePrefix: 'Op.',
    opusNumber: '42',
    additionalText: 'bis',
    opusTitle: {
      uk: 'Перший струнний квартет (d moll)',
      en: 'First String Quartet (d minor)'
    },
    creationDate: '1922',
    genre: {
      uk: 'Струнний квартет',
      en: 'String Quartet'
    },
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
      } as any,
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
      } as any
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
    works: [],
    performances: [],
    status: 'draft'
  });

  const [isDirty, setIsDirty] = useState(false);

  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');

  const [anchors, setAnchors] = useState<MenuAnchor>({});

  const handleOpen = (event: MouseEvent<HTMLElement>, menuId: AnchorId) =>
    setAnchors((prev) => ({ ...prev, [menuId]: event.currentTarget as HTMLButtonElement }));

  const handleClose = (menuId: AnchorId) => setAnchors((prev) => ({ ...prev, [menuId]: undefined }));

  const handleFieldChange = (field: string, value: any, isMultilingual = false) => {
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

  const handleSave = async () => {
    console.log(`✅ Дані для опусу ${id} готові до відправки:`, opusData);
    setIsDirty(false);
  };

  return (
    <Box sx={styles.container}>
      <DividedHeader
        sx={styles.header}
        originUrl="/creativity"
        rightActionsComponent={
          <HeaderRightActions
            mode="edit"
            disabled={!isDirty}
            onPublish={handleSave}
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

        <OpusDetailsSection currentLanguage={currentLanguage} data={opusData} onChange={handleFieldChange} />
        <OpusIntroSection currentLanguage={currentLanguage} data={opusData} onChange={handleFieldChange} />

        <OpusPhotosSection photos={opusData.photos} onChange={(newPhotos) => handleFieldChange('photos', newPhotos)} />

        <OpusWorksSection works={opusData.works} onChange={(newWorks) => handleFieldChange('works', newWorks)} />
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
    </Box>
  );
};
