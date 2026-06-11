import { Box, Divider, ListSubheader, Menu, MenuItem, Typography } from '@mui/material';
import { MouseEvent, useState } from 'react';

import { sharedMenuStyles } from '../../shared/shared-publication.styles';
import { styles } from './EditPublicationsView.styles';
import DeleteCardModal from '~/components/delete-card-modal/DeleteCardModal';
import {
  ACTIONS_TYPE,
  EditorLanguage,
  HEADER_MENU_OPTIONS,
  LANGUAGE_OPTIONS,
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

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Partial<Record<AnchorId, HTMLButtonElement>>;

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
  onSeoClick
}: Readonly<EditPublicationsViewProps>) {
  const [anchors, setAnchors] = useState<MenuAnchor>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const localeKey = currentLanguage === 'UA' ? 'uk' : 'en';

  const handleOpen = (event: MouseEvent<HTMLElement>, id: AnchorId) =>
    setAnchors((prev) => ({ ...prev, [id]: event.currentTarget as HTMLButtonElement }));
  const handleClose = (id: AnchorId) => setAnchors((prev) => ({ ...prev, [id]: undefined }));

  const handlePublishActionClick = (actionId: MenuActionId) => {
    onAction(actionId);
    handleClose('publish');
  };

  if (isLoading || editedContent === null) return <Box sx={styles.loadingContainer}>{'Завантаження...'}</Box>;

  const initialBlocks = editedContent[localeKey]?.content?.blocks;
  const isContentValid = Array.isArray(initialBlocks) && initialBlocks.length;
  const publishActions = (HEADER_MENU_OPTIONS.baseActions as ACTIONS_TYPE[]).filter(
    (a) => a.id !== MenuActionId.PUBLISH
  );

  return (
    <Box sx={styles.container}>
      <DividedHeader
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

      <Menu
        anchorEl={anchors['navigation']}
        open={Boolean(anchors['navigation'])}
        onClose={() => handleClose('navigation')}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: sharedMenuStyles.navigationMenuPaper } }}
        sx={sharedMenuStyles.menu}
      >
        <ListSubheader sx={styles.menuSubheader}>
          <Typography variant="subtitle2">{'Мовні версії'}</Typography>
        </ListSubheader>

        {LANGUAGE_OPTIONS.map(({ locale, key, label }) => {
          const blocks = editedContent?.[key]?.content?.blocks;
          const isDraft = !isContentEmpty(blocks);

          return (
            <MenuItem
              key={key}
              onClick={() => {
                onLanguageChange(locale);
                handleClose('navigation');
              }}
              sx={sharedMenuStyles.menuItem}
            >
              <Typography variant="textMd">{label}</Typography>
              {isDraft && (
                <Typography variant="subtitle2" sx={styles.draftCaption}>
                  {'(чернетка)'}
                </Typography>
              )}
            </MenuItem>
          );
        })}

        <Divider sx={styles.contentDevider} />
        <MenuItem
          onClick={() => {
            onSeoClick();
            handleClose('navigation');
          }}
          sx={sharedMenuStyles.menuItem}
        >
          <Typography variant="textMd">{'SEO налаштування'}</Typography>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchors['publish']}
        open={Boolean(anchors['publish'])}
        onClose={() => handleClose('publish')}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: sharedMenuStyles.publishMenuPaper } }}
        sx={sharedMenuStyles.menu}
      >
        {publishActions.map((action) => (
          <MenuItem
            sx={sharedMenuStyles.menuItem}
            key={action.id}
            onClick={() => {
              if (action.id === MenuActionId.DELETE) {
                setDeleteModalOpen(true);
                handleClose('publish');
                return;
              }
              handlePublishActionClick(action.id);
            }}
          >
            <Typography variant="textMd">{action.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

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
