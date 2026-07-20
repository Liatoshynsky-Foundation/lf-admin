import { Box, Typography } from '@mui/material';
import { MouseEvent, useState } from 'react';

import { NavigationMenuItems, PublishMenuItems } from './EditPublicationMenuItems';
import { styles } from './EditPublicationsView.styles';
import DeleteCardModal from '~/components/delete-card-modal/DeleteCardModal';
import {
  EditorLanguage,
  LocalizedEditorState,
  MenuActionId,
  PUBLICATIONS_BASE_PATH,
  PublicationsChipLabels,
  PublicationsItemType
} from '~/constants/publications';
import Badge from '~/shared/components/badge/Badge';
import { ContentEditor, isContentEmpty, SerializedContent } from '~/shared/components/content-editor';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import ActionMenu from '~/shared/components/dropdown-menu/ActionMenu';

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Record<AnchorId, HTMLButtonElement | null>;

export type PublicationViewData = {
  adminTitle?: string | null;
};

export type EditPublicationsViewProps = {
  type: PublicationsItemType;
  isLoading: boolean;
  currentData: PublicationViewData | null | undefined;
  editedContent: LocalizedEditorState | null;
  editorResetKey: number;
  currentLanguage: EditorLanguage;
  onLanguageChange: (lang: EditorLanguage) => void;
  onEditorChange: (content: SerializedContent, localeKey: 'uk' | 'en') => void;
  onAction: (actionId: MenuActionId) => void;
  onDeleteConfirm: () => void;
  onSeoClick: () => void;
  onBackClick: () => void;
};

export function EditPublicationsView({
  type,
  isLoading,
  currentData,
  editedContent,
  editorResetKey,
  currentLanguage,
  onLanguageChange,
  onEditorChange,
  onAction,
  onDeleteConfirm,
  onBackClick,
  onSeoClick
}: Readonly<EditPublicationsViewProps>) {
  const [anchors, setAnchors] = useState<MenuAnchor>({
    navigation: null,
    publish: null
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const localeKey = currentLanguage === 'UA' ? 'uk' : 'en';

  const handleOpen = (event: MouseEvent<HTMLElement>, id: AnchorId) =>
    setAnchors((prev) => ({ ...prev, [id]: event.currentTarget as HTMLButtonElement }));
  const handleClose = (id: AnchorId) => setAnchors((prev) => ({ ...prev, [id]: null }));

  const handlePublishActionClick = (actionId: MenuActionId) => {
    onAction(actionId);
    handleClose('publish');
  };

  if (isLoading || editedContent === null) return <Box sx={styles.loadingContainer}>{'Завантаження...'}</Box>;

  const initialBlocks = editedContent[localeKey]?.content?.blocks;
  const isContentValid = Array.isArray(initialBlocks) && initialBlocks.length;

  return (
    <Box sx={styles.container}>
      <DividedHeader
        onBackClick={onBackClick}
        sx={styles.header}
        originUrl={PUBLICATIONS_BASE_PATH}
        rightActionsComponent={
          <HeaderRightActions
            mode={type === 'media' ? 'seo' : 'edit'}
            onMenuOpen={(e) => handleOpen(e, 'publish')}
            onPublish={() => handlePublishActionClick(MenuActionId.PUBLISH)}
          />
        }
      >
        {type === 'media' ? (
          <Typography variant="h7">{'Редагування Ми у ЗМІ'}</Typography>
        ) : (
          <TitleDropdown
            type="multilingual"
            language={currentLanguage}
            title={currentData?.adminTitle ?? ''}
            onMenuOpen={(e) => handleOpen(e, 'navigation')}
          />
        )}
        <Badge variant={type} label={PublicationsChipLabels[type]} />
        <Badge variant="draft" />
      </DividedHeader>

      <Box sx={styles.mainContent}>
        {type !== 'media' && (
          <ContentEditor
            initialContent={isContentValid ? initialBlocks : undefined}
            key={`${currentLanguage}-${editorResetKey}`}
            persistence={{
              onChange: (content) => onEditorChange(content, localeKey)
            }}
            sx={styles.contentEditor}
            editorConfig={{ sideMenu: true }}
          />
        )}
      </Box>

      <ActionMenu
        anchorEl={anchors['navigation']}
        onClose={() => handleClose('navigation')}
        menuItems={NavigationMenuItems({
          editedContent,
          isContentEmpty,
          onLanguageChange,
          onSeoClick
        })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />

      <ActionMenu
        anchorEl={anchors['publish']}
        onClose={() => handleClose('publish')}
        menuItems={PublishMenuItems({
          MenuActionId,
          setDeleteModalOpen,
          handlePublishActionClick
        })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />

      <DeleteCardModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={() => {
          onDeleteConfirm();
          setDeleteModalOpen(false);
        }}
      />
    </Box>
  );
}
