'use client';
import { Box, Typography } from '@mui/material';

import { NavigationMenuItems, PublishMenuItems } from './GroupContentMenuItems';
import { styles } from './GroupContentView.styles';
import { GroupContentViewError } from './GroupContentViewError';
import { GroupContentViewLoading } from './GroupContentViewLoading';
import { GroupDetailsSection } from '~/shared/components/creativity/group/details-section/GroupDetailsSection';
import { GroupIntroSection } from '~/shared/components/creativity/group/intro-section/GroupIntroSection';
import { GroupPerformancesSection } from '~/shared/components/creativity/group/performances-section/GroupPerformancesSection';
import { GroupPhotosSection } from '~/shared/components/creativity/group/photos-section/GroupPhotosSection';
import { GroupWorksSection } from '~/shared/components/creativity/group/works-section/GroupWorksSection';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import ActionMenu from '~/shared/components/dropdown-menu/ActionMenu';
import { useGroupContent } from '~/shared/hooks/use-group-content/useGroupContent';

type GroupContentViewProps = Readonly<{
  id: string;
}>;

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
    handleMenuOptionClick,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleConfirmDelete
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

      <ActionMenu
        anchorEl={anchors['navigation']}
        onClose={() => handleClose('navigation')}
        menuItems={NavigationMenuItems({
          onLanguageChange: setCurrentLanguage
        })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />

      <ActionMenu
        anchorEl={anchors.publish}
        onClose={() => handleClose('publish')}
        menuItems={PublishMenuItems({
          onAction: handleMenuOptionClick
        })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />

      <DeleteCardModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleConfirmDelete}
        description="Ви впевнені, що хочете видалити цю групу?"
      />
    </Box>
  );
};
