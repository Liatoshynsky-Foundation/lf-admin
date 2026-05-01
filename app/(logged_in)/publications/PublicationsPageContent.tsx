'use client';

import { Box, Button, MenuItem } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { styles } from './PublicationsPageContent.styles';
import type { FilesSortValue } from '~/constants/files';
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
  PUBLICATIONS_STATUSES,
  PUBLICATIONS_TABS,
  type PublicationsItemType,
  type PublicationsLanguageValue,
  type PublicationsStatusValue,
  type PublicationsTabValue
} from '~/constants/publications';
import ContentCard, { type ContentType } from '~/shared/components/content-card/ContentCard';
import DropdownMenu from '~/shared/components/dropdown-menu/DropdownMenu';
import { EmptyState } from '~/shared/components/empty-state';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { filterSelectStyles } from '~/shared/components/selector/FilterSelect.styles';
import { useAllEvents } from '~/shared/hooks/use-events/useEvents';
import { useAllMediaMentions } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useAllNews } from '~/shared/hooks/use-news/useNews';
import { usePublicationsFiltering } from '~/shared/hooks/use-publications';
import { mainHexPallete as colors } from '~/shared/theme/colors';
import type { LocalizedString } from '~/types/common';
import { type AllEventsQuery, type AllMediaMentionsQuery, type AllNewsQuery } from '~/types/graphql/generated/graphql';
import { normalizeSearch } from '~/utils/normalizeSearch';

type PublicationsPageContentProps = Readonly<{
  activeTab: PublicationsTabValue;
}>;

type PublicationCardImage = {
  src: string;
  alt: { uk: string; en: string };
};

type PublicationCardItem = {
  id: string;
  title: string;
  sortTitle: string;
  type: PublicationsItemType;
  dateAdded: string;
  createdAtRaw: string;
  status: PublicationsStatusValue;
  language: PublicationsLanguageValue;
  cardType: ContentType;
  cardStatus: PublicationsStatusValue;
  titleData: Partial<LocalizedString>;
  coverImage: PublicationCardImage;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

type NewsItem = AllNewsQuery['allNews'][number];
type EventItem = AllEventsQuery['allEvents'][number];
type MediaMentionItem = AllMediaMentionsQuery['allMediaMentions'][number];
type PublicationsTabStateMap<T> = {
  news: T;
  media: T;
  events: T;
};

type NullableLocalizedString = Partial<Record<keyof LocalizedString, string | null>>;
type MaybeLocalizedValue = string | NullableLocalizedString | null | undefined;

const DEFAULT_COVER_IMAGE = '/images/image.png';
const DEFAULT_COVER_ALT = 'Обкладинка матеріалу';
const SORT_FALLBACK_DATE = '1970-01-01T00:00:00.000Z';

const comparePublicationItems = (
  left: PublicationCardItem,
  right: PublicationCardItem,
  sortValue: FilesSortValue
): number => {
  if (sortValue === 'name_asc') {
    return left.sortTitle.localeCompare(right.sortTitle, 'uk');
  }

  if (sortValue === 'name_desc') {
    return right.sortTitle.localeCompare(left.sortTitle, 'uk');
  }

  const leftDate = new Date(left.createdAtRaw).getTime();
  const rightDate = new Date(right.createdAtRaw).getTime();

  if (sortValue === 'date_asc') {
    return leftDate - rightDate;
  }

  return rightDate - leftDate;
};

const mergeSortedPublicationItems = (
  leftItems: PublicationCardItem[],
  rightItems: PublicationCardItem[],
  sortValue: FilesSortValue
): PublicationCardItem[] => {
  const mergedItems: PublicationCardItem[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftItems.length && rightIndex < rightItems.length) {
    if (comparePublicationItems(leftItems[leftIndex], rightItems[rightIndex], sortValue) <= 0) {
      mergedItems.push(leftItems[leftIndex]);
      leftIndex += 1;
      continue;
    }

    mergedItems.push(rightItems[rightIndex]);
    rightIndex += 1;
  }

  return [...mergedItems, ...leftItems.slice(leftIndex), ...rightItems.slice(rightIndex)];
};

const getPublicationSearchOptions = (items: PublicationCardItem[]) => {
  const uniqueOptions = new Map<string, { id: string; title: string }>();

  items.forEach((item) => {
    const normalizedTitle = normalizeSearch(item.title);

    if (!uniqueOptions.has(normalizedTitle)) {
      uniqueOptions.set(normalizedTitle, { id: item.id, title: item.title });
    }
  });

  return Array.from(uniqueOptions.values());
};

const getPrimaryText = (value: MaybeLocalizedValue, fallback = ''): string => {
  if (typeof value === 'string') {
    return value || fallback;
  }

  return value?.uk || value?.en || fallback;
};

const toLocalizedCardValue = (value: MaybeLocalizedValue, fallback = ''): Partial<LocalizedString> => {
  if (typeof value === 'string') {
    return {
      uk: value || fallback,
      en: undefined
    };
  }

  return {
    uk: value?.uk ?? fallback,
    en: value?.en ?? undefined
  };
};

const toLocalizedString = (value: MaybeLocalizedValue, fallback = ''): LocalizedString => {
  if (typeof value === 'string') {
    const localizedValue = value.trim() || fallback;

    return {
      uk: localizedValue,
      en: localizedValue
    };
  }

  const uk = value?.uk?.trim() || value?.en?.trim() || fallback;
  const en = value?.en?.trim() || value?.uk?.trim() || fallback;

  return { uk, en };
};

const getSortableDate = (...values: Array<string | null | undefined>): string => {
  return values.find((value): value is string => Boolean(value)) ?? SORT_FALLBACK_DATE;
};

const getLanguageFromLocalizedValue = (value: NullableLocalizedString): PublicationsLanguageValue => {
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

const isPublicationCardStatus = (status: string): status is PublicationsStatusValue => {
  return PUBLICATIONS_STATUSES.includes(status as PublicationsStatusValue);
};

const mapCardType = (type: PublicationsItemType): ContentType => {
  if (type === 'events') {
    return 'event';
  }

  return type;
};

const getPublicationEditHref = (item: Pick<PublicationCardItem, 'type' | 'id'>): string => {
  return `/publications/${item.type}/${item.id}/edit`;
};

const mapNewsItem = (item: NewsItem): PublicationCardItem | null => {
  if (!isPublicationCardStatus(item.status)) {
    return null;
  }

  const publicationStatus = item.status;

  const fallbackTitle = item.adminTitle;
  const title = toLocalizedCardValue(item.title, fallbackTitle);
  const titleText = getPrimaryText(item.title, fallbackTitle);
  const sortTitle = fallbackTitle || titleText;
  const sortableDate = getSortableDate(item.createdAt, item.updatedAt, item.publishedAt, item.newsDate);
  const coverImage = item.coverImage;

  return {
    id: item.id,
    title: titleText,
    sortTitle,
    titleData: title,
    type: 'news',
    cardType: mapCardType('news'),
    dateAdded: sortableDate,
    createdAtRaw: sortableDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt ?? undefined,
    status: publicationStatus,
    cardStatus: publicationStatus,
    language: getLanguageFromLocalizedValue(title),
    coverImage: {
      src: coverImage?.src || DEFAULT_COVER_IMAGE,
      alt: toLocalizedString(coverImage?.alt, titleText || DEFAULT_COVER_ALT)
    }
  };
};

const mapEventItem = (item: EventItem): PublicationCardItem | null => {
  if (!isPublicationCardStatus(item.status)) {
    return null;
  }

  const publicationStatus = item.status;

  const fallbackTitle = item.adminTitle;
  const title = toLocalizedCardValue(item.title, fallbackTitle);
  const titleText = getPrimaryText(item.title, fallbackTitle);
  const sortTitle = fallbackTitle || titleText;
  const sortableDate = getSortableDate(item.publishedAt, item.eventDateTimeStart, item.eventDateTimeEnd);

  const coverImage = item.coverImage;

  return {
    id: item.id,
    title: titleText,
    sortTitle,
    titleData: title,
    type: 'events',
    cardType: mapCardType('events'),
    dateAdded: sortableDate,
    createdAtRaw: sortableDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt ?? undefined,
    status: publicationStatus,
    cardStatus: publicationStatus,
    language: getLanguageFromLocalizedValue(title),
    coverImage: {
      src: coverImage?.src || DEFAULT_COVER_IMAGE,
      alt: toLocalizedString(coverImage?.alt, titleText || DEFAULT_COVER_ALT)
    }
  };
};

const mapMediaMentionItem = (item: MediaMentionItem): PublicationCardItem | null => {
  if (!isPublicationCardStatus(item.status)) {
    return null;
  }

  const publicationStatus = item.status;

  const fallbackTitle = item.adminTitle;
  const titleData = toLocalizedCardValue(item.title, fallbackTitle);
  const titleText = getPrimaryText(item.title, fallbackTitle);
  const sortTitle = fallbackTitle || titleText;
  const sortableDate = getSortableDate(item.createdAt, item.updatedAt, item.publishedAt);

  return {
    id: item.id,
    title: titleText,
    sortTitle,
    titleData,
    type: 'media',
    cardType: mapCardType('media'),
    dateAdded: sortableDate,
    createdAtRaw: sortableDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt ?? undefined,
    status: publicationStatus,
    cardStatus: publicationStatus,
    language: getLanguageFromLocalizedValue(titleData),
    coverImage: {
      src: item.coverImage?.src || DEFAULT_COVER_IMAGE,
      alt: toLocalizedString(item.coverImage?.alt, titleText || DEFAULT_COVER_ALT)
    }
  };
};

const getActiveTabState = <T,>(
  activeTab: PublicationsTabValue,
  states: PublicationsTabStateMap<T>,
  getAllState: (states: PublicationsTabStateMap<T>) => T
) => {
  if (activeTab === 'all') {
    return getAllState(states);
  }

  if (activeTab === 'news') {
    return states.news;
  }

  if (activeTab === 'media') {
    return states.media;
  }

  if (activeTab === 'events') {
    return states.events;
  }

  return getAllState(states);
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
                component={Link}
                href={option.href}
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
  const { requestFilters, sortValue, toolbarProps, sortProps } = usePublicationsFiltering();
  const shouldFetchNews = activeTab === 'all' || activeTab === 'news';
  const shouldFetchEvents = activeTab === 'all' || activeTab === 'events';
  const shouldFetchMedia = activeTab === 'all' || activeTab === 'media';
  const {
    data: newsData,
    loading: isNewsLoading,
    error: newsError
  } = useAllNews(requestFilters.news, { skip: !shouldFetchNews });
  const {
    data: eventsData,
    loading: isEventsLoading,
    error: eventsError
  } = useAllEvents(requestFilters.events, { skip: !shouldFetchEvents });
  const {
    data: mediaData,
    loading: isMediaLoading,
    error: mediaError
  } = useAllMediaMentions(requestFilters.media, { skip: !shouldFetchMedia });

  const newsItems = useMemo<PublicationCardItem[]>(() => {
    return (newsData?.allNews ?? []).map(mapNewsItem).filter((item): item is PublicationCardItem => Boolean(item));
  }, [newsData?.allNews]);

  const eventItems = useMemo<PublicationCardItem[]>(() => {
    return (eventsData?.allEvents ?? []).map(mapEventItem).filter((item): item is PublicationCardItem => Boolean(item));
  }, [eventsData?.allEvents]);

  const mediaItems = useMemo<PublicationCardItem[]>(() => {
    return (mediaData?.allMediaMentions ?? [])
      .map(mapMediaMentionItem)
      .filter((item): item is PublicationCardItem => Boolean(item));
  }, [mediaData?.allMediaMentions]);

  const visibleItems = useMemo<PublicationCardItem[]>(() => {
    if (activeTab === 'news') {
      return newsItems;
    }

    if (activeTab === 'events') {
      return eventItems;
    }

    if (activeTab === 'media') {
      return mediaItems;
    }

    const mergedNewsMedia = mergeSortedPublicationItems(newsItems, mediaItems, sortValue);
    return mergeSortedPublicationItems(mergedNewsMedia, eventItems, sortValue);
  }, [activeTab, mediaItems, eventItems, newsItems, sortValue]);

  const titleOptions = useMemo(() => getPublicationSearchOptions(visibleItems), [visibleItems]);
  const resolvedToolbarProps = useMemo(
    () => ({
      ...toolbarProps,
      search: toolbarProps.search
        ? {
          ...toolbarProps.search,
          options: titleOptions
        }
        : undefined
    }),
    [titleOptions, toolbarProps]
  );
  const hasActiveCriteria = Boolean(toolbarProps.search?.search.trim()) || Boolean(toolbarProps.activeFiltersCount);
  const hasBaseItems = visibleItems.length > 0;
  const isLoading = getActiveTabState(
    activeTab,
    {
      news: shouldFetchNews ? isNewsLoading : false,
      events: shouldFetchEvents ? isEventsLoading : false,
      media: shouldFetchMedia ? isMediaLoading : false
    },
    (states) => states.news || states.media || states.events
  );
  const activeError = getActiveTabState(
    activeTab,
    {
      news: shouldFetchNews ? newsError : undefined,
      events: shouldFetchEvents ? eventsError : undefined,
      media: shouldFetchMedia ? mediaError : undefined
    },
    (states) => states.news ?? states.events ?? states.media
  );
  const shouldShowLoadingState = activeTab === 'all' ? !hasBaseItems && isLoading : isLoading;
  const shouldShowErrorState = activeTab === 'all' ? !hasBaseItems && Boolean(activeError) : Boolean(activeError);
  const emptyStateTitle = hasActiveCriteria
    ? PUBLICATIONS_EMPTY_STATE_NO_RESULTS_TITLE
    : PUBLICATIONS_EMPTY_STATE_TITLE;
  let emptyStateDescription = PUBLICATIONS_EMPTY_STATE_DESCRIPTION;

  if (hasActiveCriteria) {
    emptyStateDescription = PUBLICATIONS_EMPTY_STATE_NO_RESULTS_DESCRIPTION;
  } else if (activeTab === 'events') {
    emptyStateDescription = PUBLICATIONS_EVENTS_EMPTY_STATE_DESCRIPTION;
  }

  const content = (() => {
    if (shouldShowLoadingState) {
      return (
        <EmptyState title={PUBLICATIONS_LOADING_STATE_TITLE} description={PUBLICATIONS_LOADING_STATE_DESCRIPTION} />
      );
    }

    if (shouldShowErrorState) {
      return <EmptyState title={PUBLICATIONS_ERROR_STATE_TITLE} description={PUBLICATIONS_ERROR_STATE_DESCRIPTION} />;
    }

    if (visibleItems.length) {
      return (
        <Box sx={styles.cardGrid}>
          {visibleItems.map((item) => (
            <Box key={item.id} sx={styles.cardWrapper}>
              <ContentCard
                type={item.cardType}
                coverImage={item.coverImage}
                title={item.titleData}
                status={item.cardStatus}
                updatedAt={item.updatedAt}
                createdAt={item.createdAt}
                publishedAt={item.publishedAt}
                editHref={getPublicationEditHref(item)}
                onClickMenu={() => undefined}
              />
            </Box>
          ))}
        </Box>
      );
    }

    return <EmptyState title={emptyStateTitle} description={emptyStateDescription} />;
  })();

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
        {...resolvedToolbarProps}
        dataTestId="publications-control-panel"
        bottomTrailingContent={<SortSelect {...sortProps} minWidth={208} dataTestId="publications-sort-select" />}
      />

      {content}
    </Box>
  );
}
