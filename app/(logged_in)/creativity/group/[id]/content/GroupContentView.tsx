'use client';
import { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

import { NavigationMenuItems, PublishMenuItems } from './GroupContentMenuItems';
import { styles } from './GroupContentView.styles';
import { GroupContentViewError } from './GroupContentViewError';
import { GroupContentViewLoading } from './GroupContentViewLoading';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
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
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useGroupContent } from '~/shared/hooks/use-group-content/useGroupContent';

type GroupContentViewProps = Readonly<{
  id: string;
}>;

const DEFAULT_BLOCKS_ORDER = ['details', 'intro', 'photos', 'works', 'performances'];

export const GroupContentView = ({ id }: GroupContentViewProps) => {
  const {
    loading,
    error,
    groupData,
    isDirty,
    currentLanguage,
    errors,
    invalidCompositionIds,
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

  const sortableBlocks = groupData.blocksOrder?.length ? groupData.blocksOrder : DEFAULT_BLOCKS_ORDER;

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, sortableBlocks, (reordered) => {
      handleFieldChange('blocksOrder', reordered);
    });
  };

  const renderBlock = (blockId: string) => {
    switch (blockId) {
    case 'details':
      return (
        <CollapsibleBlock
          title="Деталі"
          expanded={isDetailsExpanded}
          onChange={(_, isExpanded) => setIsDetailsExpanded(isExpanded)}
          grip
        >
          <GroupDetailsSection
            currentLanguage={currentLanguage}
            data={groupData}
            errors={errors}
            onChange={handleFieldChange}
          />
        </CollapsibleBlock>
      );
    case 'intro':
      return (
        <CollapsibleBlock title="Вступна секція" defaultExpanded grip>
          <GroupIntroSection currentLanguage={currentLanguage} data={groupData} onChange={handleFieldChange} />
        </CollapsibleBlock>
      );
    case 'photos':
      return (
        <CollapsibleBlock title="Фото" defaultExpanded grip>
          <GroupPhotosSection
            currentLanguage={currentLanguage}
            photos={groupData.photos}
            errors={errors}
            onChange={(newPhotos) => handleFieldChange('photos', newPhotos)}
          />
        </CollapsibleBlock>
      );
    case 'works':
      return (
        <CollapsibleBlock title="Твори" defaultExpanded grip>
          <GroupWorksSection
            works={groupData.compositions}
            onChange={(newWorks) => handleFieldChange('compositions', newWorks)}
            compositionErrors={errors}
            invalidCompositionIds={invalidCompositionIds}
          />
        </CollapsibleBlock>
      );
    case 'performances':
      return (
        <CollapsibleBlock title="Всі версії виконання опису" defaultExpanded grip>
          <GroupPerformancesSection
            currentLanguage={currentLanguage}
            sectionTitle={groupData.performancesTitle}
            performances={groupData.performances}
            errors={errors}
            onChangeSectionTitle={(newTitle) => handleFieldChange('performancesTitle', newTitle)}
            onChangePerformances={(newPerformances) => handleFieldChange('performances', newPerformances)}
          />
        </CollapsibleBlock>
      );
    default:
      return null;
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
          title={publishedTitle[langKey as 'uk' | 'en'] || 'Редагування контенту групи'}
          onMenuOpen={(e) => handleOpen(e, 'navigation')}
        />

        <ProgressStatus isSaved={!isDirty} />
      </DividedHeader>

      <Box sx={styles.mainContent}>
        <Typography variant="body2" sx={styles.optionalContentText}>
          Заповнення контентом не є обов’язковим
        </Typography>

        {sortableBlocks.length > 0 && (
          <SortableList onDragEnd={handleDragEnd} id="opus-blocks-list" items={sortableBlocks}>
            {sortableBlocks.map((blockId: string) => {
              const blockContent = renderBlock(blockId);
              if (!blockContent) return null;
              return (
                <SortableItemWrapper id={blockId} key={blockId}>
                  {blockContent}
                </SortableItemWrapper>
              );
            })}
          </SortableList>
        )}
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
        description="Групу буде видалено. Пов'язані твори, зображення, файли та аудіо буде відв'язано від групи. Цю дію неможливо скасувати. Ви впевнені, що хочете продовжити?"
      />
    </Box>
  );
};
