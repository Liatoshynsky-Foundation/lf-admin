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
import { MouseEvent, useState } from 'react';

import { mockAvailableWorks, mockInitialGroupData } from './group.mock';
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
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';

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

export const GroupContentView = ({ id }: GroupContentViewProps) => {
  const [groupData, setGroupData] = useState<GroupData>(mockInitialGroupData);
  const [isDirty, setIsDirty] = useState(false);
  const { navigate } = useNavigationGuard();
  useUnsavedChanges(isDirty);
  const handleBackClick = () => {
    const previousUrl = document.referrer;

    const cameFromSettings = previousUrl.includes(`/creativity/group/${id}/edit`);

    const targetUrl = cameFromSettings ? `/creativity/group/${id}/edit` : '/creativity';

    navigate(targetUrl);
  };

  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [anchors, setAnchors] = useState<MenuAnchor>({});

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleOpen = (event: MouseEvent<HTMLElement>, menuId: AnchorId) =>
    setAnchors((prev) => ({ ...prev, [menuId]: event.currentTarget as HTMLButtonElement }));

  const handleClose = (menuId: AnchorId) => setAnchors((prev) => ({ ...prev, [menuId]: undefined }));

  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';
  const derivedGenres = Array.from(new Set(groupData.works.map((w) => w.genre?.[langKey]).filter(Boolean))).join(', ');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const numberVal = Number(groupData.groupNumber);

    if (!groupData.titlePrefix) {
      newErrors.titlePrefix = 'Оберіть тип';
    }
    if (!groupData.groupNumber || groupData.groupNumber.toString().trim() === '') {
      newErrors.groupNumber = 'Обов’язкове поле';
    } else if (numberVal < 0) {
      newErrors.groupNumber = 'Значення не може бути від\'ємним';
    }
    if (!groupData.groupTitle[langKey] || groupData.groupTitle[langKey].trim() === '') {
      newErrors.groupTitle = 'Обов’язкове поле';
    }
    if (!groupData.creationYear || groupData.creationYear.trim() === '') {
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

  const handlePublishClick = () => {
    if (!validate()) return;
    setIsInfoModalOpen(true);
  };

  const handleMenuOptionClick = (optionId: string) => {
    handleClose('publish');
    if (optionId !== 'DELETE' && !validate()) return;
    setIsInfoModalOpen(true);
  };

  return (
    <Box sx={styles.container}>
      <DividedHeader
        sx={styles.header}
        originUrl="/creativity"
        onBackClick={handleBackClick}
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
          title={groupData.groupTitle[langKey] || 'Редагування опусу'}
          onMenuOpen={(e) => handleOpen(e, 'navigation')}
        />

        <ProgressStatus isSaved={!isDirty} />
      </DividedHeader>

      <Box sx={styles.mainContent}>
        <Typography variant="body2" sx={styles.optionalContentText}>
          Заповнення контентом не є обов’язковим
        </Typography>

        <CollapsibleBlock title="Деталі" defaultExpanded>
          <GroupDetailsSection
            currentLanguage={currentLanguage}
            data={groupData}
            derivedGenre={derivedGenres}
            errors={errors}
            onChange={handleFieldChange}
          />
        </CollapsibleBlock>

        <CollapsibleBlock title="Вступна секція" defaultExpanded>
          <GroupIntroSection currentLanguage={currentLanguage} data={groupData} onChange={handleFieldChange} />
        </CollapsibleBlock>

        <CollapsibleBlock title="Фото" defaultExpanded>
          <GroupPhotosSection
            photos={groupData.photos}
            onChange={(newPhotos) => handleFieldChange('photos', newPhotos)}
          />
        </CollapsibleBlock>

        <CollapsibleBlock title="Твори" defaultExpanded>
          <GroupWorksSection
            works={groupData.works}
            availableWorks={mockAvailableWorks}
            onChange={(newWorks) => handleFieldChange('works', newWorks)}
          />
        </CollapsibleBlock>

        <CollapsibleBlock title="Всі версії виконання опису" defaultExpanded>
          <GroupPerformancesSection
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
