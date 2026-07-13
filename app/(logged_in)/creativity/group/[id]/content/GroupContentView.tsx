'use client';

import {
  Box,
  Divider,
  ListSubheader,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';

import { styles } from './GroupContentView.styles';
import { GroupContentViewError } from './GroupContentViewError';
import { GroupContentViewLoading } from './GroupContentViewLoading';
import { LANGUAGE_OPTIONS } from '~/constants/publications';
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
import { useGroupContent } from '~/shared/hooks/use-group-content/useGroupContent';

type GroupContentViewProps = Readonly<{
  id: string;
}>;

const PUBLISH_MENU_OPTIONS = [
  { id: 'PUBLISH', label: 'Опублікувати' },
  { id: 'PUBLISH_AND_EXIT', label: 'Опублікувати і вийти' },
  { id: 'DELETE', label: 'Видалити' }
];

export const GroupContentView = ({ id }: GroupContentViewProps) => {
  const {
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
    handleMenuOptionClick
  } = useGroupContent(id);

  if (error) {
    return <GroupContentViewError message={error.message} />;
  }

  if (loading || !groupData) {
    return <GroupContentViewLoading />;
  }

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
          title={publishedTitle[langKey as 'uk' | 'en'] || 'Редагування контенту групи'}
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
    </Box>
  );
};
