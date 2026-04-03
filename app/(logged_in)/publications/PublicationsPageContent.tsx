'use client';

import { Box, Button, MenuItem, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import {
  PUBLICATIONS_CREATE_OPTIONS,
  PUBLICATIONS_EMPTY_STATE_DESCRIPTION,
  PUBLICATIONS_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  PUBLICATIONS_EMPTY_STATE_NO_RESULTS_TITLE,
  PUBLICATIONS_EMPTY_STATE_TITLE,
  PUBLICATIONS_ERROR_STATE_DESCRIPTION,
  PUBLICATIONS_ERROR_STATE_TITLE,
  PUBLICATIONS_EVENTS_EMPTY_STATE_DESCRIPTION,
  PUBLICATIONS_LOADING_STATE_DESCRIPTION,
  PUBLICATIONS_LOADING_STATE_TITLE,
  PUBLICATIONS_PAGE_TITLE,
  PUBLICATIONS_TABS,
  type PublicationsItemType,
  type PublicationsLanguageValue,
  type PublicationsStatusValue,
  type PublicationsTabValue
} from '~/constants/publications';
import ContentCard, { type ContentType } from '~/shared/components/content-card/ContentCard';
import { colors } from '~/shared/components/design-system/button/Button.styles';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { useAllMediaMentions } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useAllNews } from '~/shared/hooks/use-news/useNews';
import { usePublicationsFiltering, type UsePublicationsFilteringItem } from '~/shared/hooks/use-publications';
import {
  type AllMediaMentionsQuery,
  type AllNewsQuery,
  MediaStatus,
  NewsStatus
} from '~/types/graphql/generated/graphql';

type PublicationsPageContentProps = Readonly<{
  activeTab: PublicationsTabValue;
}>;

type PublicationCardItem = UsePublicationsFilteringItem & {
  slug: string;
  cardType: ContentType;
  cardStatus: PublicationsStatusValue;
  titleData: {
    uk?: string;
    en?: string;
  };
  coverImage: {
    src: string;
    alt: {
      uk?: string;
      en?: string;
    };
  };
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
};

type NewsItem = AllNewsQuery['allNews'][number];
type MediaMentionItem = AllMediaMentionsQuery['allMediaMentions'][number];

const DEFAULT_COVER_IMAGE = '/images/image.png';
const DEFAULT_COVER_ALT = 'Обкладинка матеріалу';

const getLanguageFromLocalizedValue = (value: { uk?: string | null; en?: string | null }): PublicationsLanguageValue => {
  const hasUk = Boolean(value.uk?.trim());
  const hasEn = Boolean(value.en?.trim());

  if (hasUk && hasEn) {
    return 'bilingual';
  }

  if (hasEn) {
    return 'en';
  }

  return 'uk';
};

const getNormalizedNewsStatus = (status: NewsStatus): PublicationsStatusValue | null => {
  switch (status) {
  case NewsStatus.Draft:
    return 'draft';
  case NewsStatus.Published:
    return 'published';
  case NewsStatus.Editing:
    return 'published_with_draft';
  default:
    return null;
  }
};

const getNormalizedMediaStatus = (status: MediaStatus): PublicationsStatusValue | null => {
  switch (status) {
  case MediaStatus.Draft:
    return 'draft';
  case MediaStatus.Published:
    return 'published';
  case MediaStatus.Editing:
    return 'published_with_draft';
  default:
    return null;
  }
};

const mapCardType = (type: PublicationsItemType): ContentType => {
  if (type === 'events') {
    return 'event';
  }

  return type;
};

const mapNewsItem = (item: NewsItem): PublicationCardItem | null => {
  const normalizedStatus = getNormalizedNewsStatus(item.status);

  if (!normalizedStatus) {
    return null;
  }

  const title = {
    uk: item.title.uk,
    en: item.title.en
  };

  return {
    id: item.id,
    slug: item.slug,
    title: item.title.uk || item.title.en,
    searchTitle: [item.title.uk, item.title.en].filter(Boolean).join(' '),
    titleData: title,
    type: 'news',
    cardType: mapCardType('news'),
    dateAdded: item.createdAt,
    createdAtRaw: item.createdAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt ?? undefined,
    status: normalizedStatus,
    cardStatus: normalizedStatus,
    language: getLanguageFromLocalizedValue(title),
    coverImage: {
      src: item.coverImage.src || DEFAULT_COVER_IMAGE,
      alt: {
        uk: item.coverImage.alt.uk || item.title.uk || DEFAULT_COVER_ALT,
        en: item.coverImage.alt.en || item.title.en || undefined
      }
    }
  };
};

const mapMediaMentionItem = (item: MediaMentionItem): PublicationCardItem | null => {
  const normalizedStatus = getNormalizedMediaStatus(item.status);

  if (!normalizedStatus) {
    return null;
  }

  const titleData = { uk: item.title };
  const coverAlt = item.coverImage?.alt || item.title || DEFAULT_COVER_ALT;

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    searchTitle: item.title,
    titleData,
    type: 'media',
    cardType: mapCardType('media'),
    dateAdded: item.createdAt,
    createdAtRaw: item.createdAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt ?? undefined,
    status: normalizedStatus,
    cardStatus: normalizedStatus,
    language: 'uk',
    coverImage: {
      src: item.coverImage?.src || DEFAULT_COVER_IMAGE,
      alt: { uk: coverAlt }
    }
  };
};

const getActiveTabLoadingState = (
  activeTab: PublicationsTabValue,
  states: { news: boolean; media: boolean; events: boolean }
) => {
  if (activeTab === 'news') {
    return states.news;
  }

  if (activeTab === 'media') {
    return states.media;
  }

  if (activeTab === 'events') {
    return states.events;
  }

  return states.news || states.media || states.events;
};

const getActiveTabErrorState = (
  activeTab: PublicationsTabValue,
  states: { news?: Error; media?: Error; events?: Error }
) => {
  if (activeTab === 'news') {
    return states.news;
  }

  if (activeTab === 'media') {
    return states.media;
  }

  if (activeTab === 'events') {
    return states.events;
  }

  return states.news || states.media || states.events;
};

function PublicationsCreateAction() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleToggleMenu = () => {
    setAnchorEl((previous) => (previous ? null : triggerRef.current));
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="contained"
        onClick={handleToggleMenu}
        endIcon={<ChevronDown size={18} aria-hidden="true" />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        sx={{
          borderRadius: '20px',
          px: '24px',
          py: '8px',
          minHeight: '40px',
          textTransform: 'none',
          color: colors.black,
          boxShadow: 'none',
          fontSize: '16px',
          lineHeight: 1.5,
          bgcolor: colors.yellow[500],
          '&:hover': {
            bgcolor: colors.yellow[600],
            boxShadow: 'none'
          }
        }}
      >
        Створити
      </Button>

      <DropdownMenu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{
          '& .MuiPaper-root': {
            width: '170px'
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        menuList={
          <Box sx={{ px: '8px', py: '4px' }}>
            {PUBLICATIONS_CREATE_OPTIONS.map((option) => (
              <MenuItem
                key={option.id}
                onClick={handleCloseMenu}
                sx={{
                  ...filterSelectStyles.menuItem,
                  minHeight: 'auto',
                  px: '12px',
                  py: '8px',
                  borderRadius: '8px',
                  color: colors.black,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&.Mui-focusVisible': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Box>
        }
      />
    </>
  );
}

export function PublicationsPageContent({ activeTab }: PublicationsPageContentProps) {
  const { data: newsData, loading: isNewsLoading, error: newsError } = useAllNews();
  const { data: mediaData, loading: isMediaLoading, error: mediaError } = useAllMediaMentions();

  const allItems = useMemo<PublicationCardItem[]>(() => {
    const mappedNews = (newsData?.allNews ?? []).map(mapNewsItem).filter((item): item is PublicationCardItem => Boolean(item));
    const mappedMedia = (mediaData?.allMediaMentions ?? [])
      .map(mapMediaMentionItem)
      .filter((item): item is PublicationCardItem => Boolean(item));

    return [...mappedNews, ...mappedMedia];
  }, [mediaData?.allMediaMentions, newsData?.allNews]);

  const { filteredItems, toolbarProps, sortProps } = usePublicationsFiltering(allItems, activeTab);
  const hasActiveCriteria = Boolean(toolbarProps.search?.search.trim()) || Boolean(toolbarProps.activeFiltersCount);
  const hasBaseItems = allItems.length > 0;
  const isLoading = getActiveTabLoadingState(activeTab, {
    news: isNewsLoading,
    media: isMediaLoading,
    events: false
  });
  const activeError = getActiveTabErrorState(activeTab, {
    news: newsError,
    media: mediaError,
    events: undefined
  });
  const shouldShowLoadingState = activeTab === 'all' ? !hasBaseItems && isLoading : isLoading;
  const shouldShowErrorState = activeTab === 'all' ? !hasBaseItems && Boolean(activeError) : Boolean(activeError);
  const emptyStateTitle = hasActiveCriteria
    ? PUBLICATIONS_EMPTY_STATE_NO_RESULTS_TITLE
    : PUBLICATIONS_EMPTY_STATE_TITLE;
  const emptyStateDescription = hasActiveCriteria
    ? PUBLICATIONS_EMPTY_STATE_NO_RESULTS_DESCRIPTION
    : activeTab === 'events'
      ? PUBLICATIONS_EVENTS_EMPTY_STATE_DESCRIPTION
      : PUBLICATIONS_EMPTY_STATE_DESCRIPTION;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      <PageHeader
        title={PUBLICATIONS_PAGE_TITLE}
        activeTab={activeTab}
        tabs={PUBLICATIONS_TABS}
        action={<PublicationsCreateAction />}
      />

      <FilteringToolbar
        {...toolbarProps}
        dataTestId="publications-control-panel"
        bottomTrailingContent={
          <SortSelect
            {...sortProps}
            minWidth={208}
            dataTestId="publications-sort-select"
          />
        }
      />

      {shouldShowLoadingState ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            p: '24px',
            borderRadius: '20px',
            border: `1px dashed ${colors.blue[300]}`,
            bgcolor: colors.blue[50]
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '22px',
              lineHeight: 1.4,
              fontWeight: 700,
              color: colors.black
            }}
          >
            {PUBLICATIONS_LOADING_STATE_TITLE}
          </Typography>

          <Typography sx={{ fontSize: '16px', lineHeight: 1.6, color: colors.blue[800] }}>
            {PUBLICATIONS_LOADING_STATE_DESCRIPTION}
          </Typography>
        </Box>
      ) : shouldShowErrorState ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            p: '24px',
            borderRadius: '20px',
            border: `1px dashed ${colors.blue[300]}`,
            bgcolor: colors.blue[50]
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '22px',
              lineHeight: 1.4,
              fontWeight: 700,
              color: colors.black
            }}
          >
            {PUBLICATIONS_ERROR_STATE_TITLE}
          </Typography>

          <Typography sx={{ fontSize: '16px', lineHeight: 1.6, color: colors.blue[800] }}>
            {PUBLICATIONS_ERROR_STATE_DESCRIPTION}
          </Typography>
        </Box>
      ) : filteredItems.length ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'stretch'
          }}
        >
          {filteredItems.map((item) => (
            <Box key={item.id} data-testid="publication-card">
              <ContentCard
                type={item.cardType}
                coverImage={item.coverImage}
                title={item.titleData}
                status={item.cardStatus}
                updatedAt={item.updatedAt}
                createdAt={item.createdAt}
                publishedAt={item.publishedAt}
                onClick={() => undefined}
                onClickMenu={() => undefined}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            p: '24px',
            borderRadius: '20px',
            border: `1px dashed ${colors.blue[300]}`,
            bgcolor: colors.blue[50]
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '22px',
              lineHeight: 1.4,
              fontWeight: 700,
              color: colors.black
            }}
          >
            {emptyStateTitle}
          </Typography>

          <Typography sx={{ fontSize: '16px', lineHeight: 1.6, color: colors.blue[800] }}>
            {emptyStateDescription}
          </Typography>
        </Box>
      )}
    </Box>
  );
}