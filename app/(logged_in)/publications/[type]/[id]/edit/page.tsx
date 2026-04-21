'use client';

import { Block } from '@blocknote/core';
import { Box, Chip, Divider, ListSubheader, Menu, MenuItem, Typography } from '@mui/material';
import { notFound, useParams, useRouter } from 'next/navigation';
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './page.styles';
import {
  ACTIONS_TYPE,
  CONTENT_MUTATION_RESULTS,
  DEFAULT_EMPTY_DOCUMENT,
  EditorLanguage,
  HEADER_MENU_OPTIONS,
  LANGUAGE_OPTIONS,
  LocalizedEditorState,
  MenuActionId,
  PUBLICATION_EDIT_ERROR_STATE,
  PublicationResource,
  PUBLICATIONS_BASE_PATH,
  PublicationsChipLabels,
  PublicationsItemType
} from '~/constants/publications';
import { ContentEditor, isContentEmpty, SerializedContent } from '~/shared/components/content-editor';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import { useEventById, useUpdateEvent } from '~/shared/hooks/use-events/useEvents';
import { useMediaMentionById, useUpdateMediaMention } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useNewsById, useUpdateNews } from '~/shared/hooks/use-news/useNews';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { type EventStatus, type MediaStatus, type NewsStatus } from '~/types/graphql/generated/graphql';

type Params = {
  type: PublicationsItemType;
  id: string;
};

type AnchorId = 'navigation' | 'publish';
type MenuAnchor = Partial<Record<AnchorId, HTMLButtonElement>>;

export default function EditPublicationsPage() {
  const { type, id } = useParams<Params>();
  const router = useRouter();

  const news = useNewsById(id, { skip: type !== 'news' });
  const event = useEventById(id, { skip: type !== 'events' });
  const media = useMediaMentionById(id, { skip: type !== 'media' });

  const queryMap = {
    news,
    events: event,
    media
  };

  const activeQuery = queryMap[type];
  const isLoading = activeQuery.loading;
  const hasError = activeQuery.error;

  const currentData = useMemo(() => {
    switch (type) {
    case 'news':
      return news.data?.newsById;
    case 'events':
      return event.data?.eventById;
    case 'media':
      return media.data?.mediaMentionById;
    }
  }, [news.data, event.data, media.data]);

  const [updateNews] = useUpdateNews();
  const [updateEvent] = useUpdateEvent();
  const [updateMedia] = useUpdateMediaMention();

  const [anchors, setAnchors] = useState<MenuAnchor>({});
  const [currentLanguage, setCurrentLanguage] = useState<EditorLanguage>('UA');
  const [editedContent, setEditedContent] = useState<LocalizedEditorState | null>(null);
  const [editorResetKey, setEditorResetKey] = useState<number>(0);

  const latestBlocksRef = useRef<SerializedContent>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const localeKey = currentLanguage === 'UA' ? 'uk' : 'en';

  useEffect(() => {
    if (type === 'media' || isLoading || activeQuery.data === undefined) return;

    if (editedContent === null) {
      const resourceData = type === 'news' ? news.data?.newsById?.content : event.data?.eventById?.content;

      const hasUk = !isContentEmpty(resourceData?.uk?.content?.blocks);
      const hasEn = !isContentEmpty(resourceData?.en?.content?.blocks);

      setCurrentLanguage(!hasUk && hasEn ? 'EN' : 'UA');

      const createSafeLangObj = (blocks: Block[] | undefined) => ({
        content: {
          ...DEFAULT_EMPTY_DOCUMENT,
          blocks: !isContentEmpty(blocks) && blocks ? blocks : DEFAULT_EMPTY_DOCUMENT.blocks
        }
      });

      setEditedContent({
        uk: createSafeLangObj(resourceData?.uk?.content?.blocks),
        en: createSafeLangObj(resourceData?.en?.content?.blocks)
      });
    }
  }, [isLoading, editedContent, type, activeQuery.data, news.data, event.data]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const isNotFound = !isLoading && activeQuery.data !== undefined && currentData === null;

  if (isNotFound) notFound();

  useEffect(() => {
    if (hasError && !isLoading) toast.error(PUBLICATION_EDIT_ERROR_STATE);
  }, [hasError, isLoading]);

  const handleEditorChange = (content: SerializedContent) => {
    latestBlocksRef.current = content;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      setEditedContent((prev) => (prev ? { ...prev, [localeKey]: { content: latestBlocksRef.current } } : prev));
    }, 500);
  };

  const handleMenuAction = async (actionId: MenuActionId) => {
    const contentPayload = { content: editedContent };

    const resourceMap: Record<string, PublicationResource> = {
      news: {
        update: (status, extra = {}) => updateNews({ id, input: { ...extra, status: status as unknown as NewsStatus } })
      },
      events: {
        update: (status, extra = {}) =>
          updateEvent({ id, input: { ...extra, status: status as unknown as EventStatus } })
      },
      media: {
        update: (status, extra = {}) => updateMedia(id, { ...extra, status: status as unknown as MediaStatus })
      }
    };

    const currentResource = resourceMap[type as keyof typeof resourceMap];

    const actions: Record<MenuActionId | string, () => Promise<unknown> | void> = {
      [MenuActionId.PUBLISH]: async () => {
        const { data } = await currentResource.update(BaseContentStatuses.Published, contentPayload);
        if (data) toast.success(CONTENT_MUTATION_RESULTS.draftPublished);
      },
      [MenuActionId.SAVE_DRAFT]: async () => {
        const { data } = await currentResource.update(BaseContentStatuses.Draft, contentPayload);
        if (data) toast.success(CONTENT_MUTATION_RESULTS.draftSaved);
      },
      [MenuActionId.SAVE_AND_EXIT]: async () => {
        const { data } = await currentResource.update(BaseContentStatuses.Draft, contentPayload);
        if (data) {
          toast.success(CONTENT_MUTATION_RESULTS.draftSaved);
          router.push(PUBLICATIONS_BASE_PATH);
        }
      },
      [MenuActionId.DELETE_DRAFT]: async () => {
        const emptyContent = {
          content: {
            ...editedContent,
            [localeKey]: {
              content: { ...DEFAULT_EMPTY_DOCUMENT }
            }
          }
        };
        const { data } = await currentResource.update(
          (currentData?.status as unknown as BaseContentStatuses) ?? BaseContentStatuses.Draft,
          emptyContent
        );
        if (data) {
          toast.success(CONTENT_MUTATION_RESULTS.draftDeleted);
          latestBlocksRef.current = null;
          setEditedContent(emptyContent.content);
          setEditorResetKey((prev) => prev + 1);
        }
      }
    };

    try {
      if (actions[actionId]) await actions[actionId]();
    } catch (err) {
      toast.error(`Помилка ${err}`);
      console.error(`Action ${actionId} failed`, err);
    }

    handleClose('publish');
  };

  const handleOpen = (event: MouseEvent<HTMLElement>, id: AnchorId) =>
    setAnchors((prev) => ({ ...prev, [id]: event.currentTarget as HTMLButtonElement }));
  const handleClose = (id: AnchorId) => setAnchors((prev) => ({ ...prev, [id]: undefined }));

  if (isLoading || editedContent === null) return <Box sx={{ p: 4 }}>{'Завантаження...'}</Box>;

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
            mode={'edit'}
            onMenuOpen={(e) => handleOpen(e, 'publish')}
            onPublish={() => handleMenuAction(MenuActionId.PUBLISH)}
          />
        }
      >
        {type === 'media' ? (
          <Typography variant="customBold20Tight">{'Редагування Ми у ЗМІ'}</Typography>
        ) : (
          <TitleDropdown
            type="multilingual"
            language={currentLanguage}
            title={currentData?.adminTitle ?? ''}
            onMenuOpen={(e) => handleOpen(e, 'navigation')}
          />
        )}
        <Chip sx={styles.chip(type)} label={PublicationsChipLabels[type]} />
        <Chip sx={styles.chip('draft')} label="Чернетка" />
      </DividedHeader>

      <Box sx={styles.mainContent}>
        {type !== 'media' && (
          <ContentEditor
            initialContent={isContentValid ? initialBlocks : undefined}
            key={`${currentLanguage}-${editorResetKey}`}
            persistence={{
              onChange: handleEditorChange
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
        slotProps={{ paper: { sx: { width: 205 } } }}
        sx={styles.menu}
      >
        <ListSubheader sx={styles.menuSubheader}>
          <Typography variant="customMedium14Tight">{'Мовні версії'}</Typography>
        </ListSubheader>

        {LANGUAGE_OPTIONS.map(({ locale, key, label }) => {
          const blocks = editedContent?.[key]?.content?.blocks;
          const isDraft = !isContentEmpty(blocks);

          return (
            <MenuItem
              key={key}
              onClick={() => {
                setCurrentLanguage(locale);
                handleClose('navigation');
              }}
              sx={styles.menuItem}
            >
              <Typography variant="customMedium16">{label}</Typography>
              {isDraft && (
                <Typography variant="customItalic14" sx={styles.draftCaption}>
                  {'(чернетка)'}
                </Typography>
              )}
            </MenuItem>
          );
        })}

        <Divider sx={{ my: '7px' }} />
        <MenuItem onClick={() => router.push(`${PUBLICATIONS_BASE_PATH}/${type}/${id}/seo`)} sx={styles.menuItem}>
          <Typography variant="customMedium16">{'SEO налаштування'}</Typography>
        </MenuItem>
      </Menu>

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
          <MenuItem sx={styles.menuItem} key={action.id} onClick={() => handleMenuAction(action.id)}>
            <Typography variant="customMedium16">{action.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
