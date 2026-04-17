'use client';

import { Block } from '@blocknote/core';
import { Box, Chip, Divider, ListSubheader, Menu, MenuItem, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './page.styles';
import {
  ACTIONS_TYPE,
  HEADER_MENU_OPTIONS,
  MenuActionId,
  PUBLICATIONS_BASE_PATH,
  PublicationsChipLabels,
  PublicationsItemType
} from '~/constants/publications';
import { ContentEditor } from '~/shared/components/content-editor';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import { useDeleteEvent, useEventById, useUpdateEvent } from '~/shared/hooks/use-events/useEvents';
import {
  useDeleteMediaMention,
  useMediaMentionById,
  useUpdateMediaMention
} from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useDeleteNews, useNewsById, useUpdateNews } from '~/shared/hooks/use-news/useNews';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { EventStatus, MediaStatus, NewsStatus } from '~/types/graphql/generated/graphql';

type Params = {
  type: PublicationsItemType;
  id: string;
};

const DEFAULT_EMPTY_DOCUMENT: Block[] = [{ type: 'paragraph', content: [] } as unknown as Block];

export type LocalizedEditorState = {
  en?: {
    blocks: Block[] | null | undefined;
  };
  uk?: {
    blocks: Block[] | null | undefined;
  };
  __typename?: string;
};

type EditorLanguage = 'EN' | 'UA';

type PublicationResource = {
  update: (status: BaseContentStatuses, extra?: Record<string, unknown>) => Promise<unknown>;
  remove: () => Promise<unknown>;
};

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Partial<Record<AnchorId, HTMLButtonElement>>;

export default function EditPublicationsPage() {
  const { type, id } = useParams<Params>();
  const router = useRouter();

  const news = useNewsById(id, { skip: type !== 'news' });
  const event = useEventById(id, { skip: type !== 'events' });
  const media = useMediaMentionById(id, { skip: type !== 'media' });

  const currentData = useMemo(() => {
    switch (type) {
    case 'news':
      return news.data?.newsById;
    case 'events':
      return event.data?.eventById;
    case 'media':
      return media.data?.mediaMentionById;
    }
  }, [type, news, event, media]);

  const [updateNews] = useUpdateNews();
  const [updateEvent] = useUpdateEvent();
  const [updateMedia] = useUpdateMediaMention();

  const [deleteNews] = useDeleteNews();
  const [deleteEvent] = useDeleteEvent();
  const [deleteMedia] = useDeleteMediaMention();

  const [anchors, setAnchors] = useState<MenuAnchor>({});
  const [editedContent, setEditedContent] = useState<LocalizedEditorState | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');

  const localeKey = currentLanguage === 'UA' ? 'uk' : 'en';

  useEffect(() => {
    const currentResourceData =
      type === 'news' ? news.data?.newsById : type === 'events' ? event.data?.eventById : null;

    if (editedContent === null && currentResourceData?.content) {
      const getSafeBlocks = (langData: Record<'blocks', Block[] | undefined>): Block[] => {
        const arr = langData?.blocks;
        return Array.isArray(arr) && arr.length > 0 ? arr : DEFAULT_EMPTY_DOCUMENT;
      };

      setEditedContent({
        uk: { blocks: getSafeBlocks(currentResourceData?.content?.uk) },
        en: { blocks: getSafeBlocks(currentResourceData?.content?.en) }
      });
    }
  }, [event.data, currentLanguage]);

  const isLoading = event.loading || news.loading || media.loading;
  const hasError = event.error || news.error || media.error;

  const status = {
    isReady: !hasError && !isLoading,
    errorMessage: hasError ? 'Помилка серверу' : null
  };

  useEffect(() => {
    if (status.errorMessage) toast.error(status.errorMessage);
  }, [status.errorMessage]);

  const handleMenuAction = async (actionId: MenuActionId) => {
    const contentPayload = {
      content: editedContent
    };

    const resourceMap: Record<string, PublicationResource> = {
      news: {
        update: (status, extra = {}) =>
          updateNews({ id, input: { ...extra, status: status as unknown as NewsStatus } }),
        remove: () => deleteNews({ id })
      },
      events: {
        update: (status, extra = {}) =>
          updateEvent({ id, input: { ...extra, status: status as unknown as EventStatus } }),
        remove: () => deleteEvent({ id })
      },
      media: {
        update: (status, extra = {}) => updateMedia(id, { ...extra, status: status as unknown as MediaStatus }),
        remove: () => deleteMedia(id)
      }
    };

    const currentResource = resourceMap[type as keyof typeof resourceMap];

    const actions: Record<MenuActionId | string, () => Promise<unknown> | void> = {
      [MenuActionId.PUBLISH]: () => currentResource.update(BaseContentStatuses.Published, contentPayload),
      [MenuActionId.SAVE_DRAFT]: () => currentResource.update(BaseContentStatuses.Draft, contentPayload),
      [MenuActionId.SAVE_AND_EXIT]: async () => {
        await currentResource.update(BaseContentStatuses.Draft, contentPayload);
        router.push(PUBLICATIONS_BASE_PATH);
      },
      [MenuActionId.DELETE_DRAFT]: () => currentResource.remove()
    };

    try {
      if (actions[actionId]) {
        await actions[actionId]();
      }
    } catch (err) {
      toast.error(`Помилка ${err}`);
      console.error(`Action ${actionId} failed`, err);
    }

    handleClose('publish');
  };

  const handleOpen = (event: MouseEvent<HTMLElement>, id: AnchorId) => {
    setAnchors((prev) => ({ ...prev, [id]: event.currentTarget as HTMLButtonElement }));
  };

  const handleClose = (id: AnchorId) => {
    setAnchors((prev) => ({ ...prev, [id]: undefined }));
  };

  const baseActions = HEADER_MENU_OPTIONS.baseActions as ACTIONS_TYPE[];
  const publishActions = [...baseActions].filter((action) => action.id !== MenuActionId.PUBLISH);

  const currentBlocks = editedContent?.[localeKey]?.blocks;

  const initialBlocksForEditor = currentBlocks && currentBlocks.length > 0 ? currentBlocks : undefined;

  const renderChips = (
    <>
      <Chip sx={styles.chip(type)} label={PublicationsChipLabels[type]} />
      <Chip sx={styles.chip('draft')} label="Чернетка" />
    </>
  );

  const renderHeaderChild = (
    <>
      {type === 'media' ? (
        <Typography variant="customBold20Tight">Редагування Ми у ЗМІ</Typography>
      ) : (
        <TitleDropdown
          type="multilingual"
          language={currentLanguage}
          title={currentData?.adminTitle ?? ''}
          onMenuOpen={(e) => handleOpen(e, 'navigation')}
        />
      )}
      {renderChips}
      {type !== 'media' && <ProgressStatus isSaved={false} />}
    </>
  );

  const renderNavigationMenu = (
    <Menu
      anchorEl={anchors['navigation']}
      open={Boolean(anchors['navigation'])}
      onClose={() => handleClose('navigation')}
      disableScrollLock
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: { sx: { width: 205 } }
      }}
      sx={styles.menu}
    >
      <ListSubheader sx={styles.menuSubheader}>
        <Typography variant="customMedium14Tight">Мовні версії</Typography>
      </ListSubheader>

      <MenuItem
        onClick={() => {
          setCurrentLanguage('UA');
          handleClose('navigation');
        }}
        sx={styles.menuItem}
      >
        <Typography variant="customMedium16">Українська</Typography>
        {Array.isArray(editedContent?.uk?.blocks) && editedContent.uk.blocks.length > 1 && (
          <>
            <Typography variant="customItalic14" sx={styles.draftCaption}>
              (чернетка)
            </Typography>
          </>
        )}
      </MenuItem>

      <MenuItem
        onClick={() => {
          setCurrentLanguage('EN');
          handleClose('navigation');
        }}
        sx={styles.menuItem}
      >
        <Typography variant="customMedium16">Англійська</Typography>

        {Array.isArray(editedContent?.en?.blocks) && editedContent.en.blocks.length > 1 && (
          <>
            <Typography variant="customItalic14" sx={styles.draftCaption}>
              (чернетка)
            </Typography>
          </>
        )}
      </MenuItem>

      <Divider sx={{ my: '7px' }} />
      <MenuItem onClick={() => handleClose('navigation')} sx={styles.menuItem}>
        <Typography variant="customMedium16">SEO налаштування</Typography>
      </MenuItem>
    </Menu>
  );

  const renderPublishMenu = (
    <Menu
      anchorEl={anchors['publish']}
      open={Boolean(anchors['publish'])}
      onClose={() => handleClose('publish')}
      disableScrollLock
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 260 } } }}
      sx={styles.menu}
    >
      {publishActions.map((action) => (
        <MenuItem sx={styles.menuItem} key={action.id} onClick={() => handleMenuAction(action.id as MenuActionId)}>
          <Typography variant="customMedium16">{action.label}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );

  if (isLoading) return <Box sx={{ p: 4 }}>Завантаження...</Box>;

  console.log(editedContent?.[localeKey]?.blocks);

  return (
    <Box sx={styles.container}>
      <DividedHeader
        sx={styles.header}
        rightActionsComponent={
          <HeaderRightActions
            mode={type === 'media' ? 'seo' : 'edit'}
            onMenuOpen={(e) => handleOpen(e, 'publish')}
            onPublish={() => handleMenuAction(MenuActionId.PUBLISH)}
          />
        }
      >
        {renderHeaderChild}
      </DividedHeader>

      <Box sx={styles.mainContent}>
        {type !== 'media' && editedContent && (
          <ContentEditor
            persistence={{
              onChange: (newBlocks) => {
                setEditedContent((prev) => ({
                  ...prev,
                  [localeKey]: newBlocks
                }));
              }
            }}
            initialContent={initialBlocksForEditor}
            key={currentLanguage}
            sx={styles.contentEditor}
            editorConfig={{ sideMenu: true }}
          />
        )}
      </Box>

      {renderNavigationMenu}
      {renderPublishMenu}
    </Box>
  );
}
