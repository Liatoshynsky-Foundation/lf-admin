import { CONTENT_VERSION, SerializedContent } from '~/shared/components/content-editor/types';
import { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import type { FilterOption } from '~/shared/components/selector/FilterSelect';
import { CropRect, LocalizedCropRect } from '~/types/common';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export const PUBLICATIONS_TYPES = ['events', 'news', 'media'] as const;

export type PublicationsTabValue = 'all' | 'events' | 'news' | 'media';
export type PublicationsItemType = Exclude<PublicationsTabValue, 'all'>;
export const PUBLICATIONS_STATUSES = [
  BaseContentStatuses.Draft,
  BaseContentStatuses.Published,
  BaseContentStatuses.Editing
] as const;

export type PublicationsStatusValue = (typeof PUBLICATIONS_STATUSES)[number];
export type PublicationsLanguageValue = 'uk' | 'en' | 'bilingual';
export type PublicationsFilterId = 'status' | 'language';

export type PublicationsTabConfig = Readonly<{
  value: PublicationsTabValue;
  label: string;
  href: string;
  disabled?: boolean;
}>;

export type PublicationsCreateOption = Readonly<{
  id: 'event' | 'news' | 'media';
  label: string;
  href: string;
}>;

export type PublicationsFilterConfig = Readonly<{
  id: PublicationsFilterId;
  label: string;
  options: readonly FilterOption[];
  menuMinWidth?: number;
}>;

type PublicationsCategoryConfig = Readonly<{
  tabValue: PublicationsItemType;
  createId: PublicationsCreateOption['id'];
  slug: string;
  tabLabel: string;
  createLabel: string;
  disabled?: boolean;
}>;

export const PUBLICATIONS_PAGE_TITLE = 'Новини та події';
export const PUBLICATIONS_EMPTY_STATE_TITLE = 'Матеріали відсутні';
export const PUBLICATIONS_EMPTY_STATE_DESCRIPTION = 'Матеріали для цієї вкладки поки відсутні.';
export const PUBLICATIONS_EVENTS_EMPTY_STATE_DESCRIPTION =
  'Матеріали для вкладки "Події" з’являться після підключення джерела даних.';
export const PUBLICATIONS_EMPTY_STATE_NO_RESULTS_TITLE = 'Результатів немає';
export const PUBLICATIONS_EMPTY_STATE_NO_RESULTS_DESCRIPTION =
  'За цими критеріями нічого не знайдено.\nСпробуйте змінити параметри фільтрів або пошуку.';
export const PUBLICATIONS_LOADING_STATE_TITLE = 'Завантаження матеріалів';
export const PUBLICATIONS_LOADING_STATE_DESCRIPTION = 'Зачекайте, поки завершиться запит.';
export const PUBLICATIONS_ERROR_STATE_TITLE = 'Не вдалося завантажити матеріали';
export const PUBLICATIONS_ERROR_STATE_DESCRIPTION = 'Спробуйте оновити сторінку або повторити пізніше.';
export const PUBLICATION_EDIT_ERROR_STATE = 'Щось пішло не так';

export const PUBLICATIONS_BASE_PATH = '/publications';

const PUBLICATIONS_CATEGORIES: ReadonlyArray<PublicationsCategoryConfig> = [
  {
    tabValue: 'events',
    createId: 'event',
    slug: 'events',
    tabLabel: 'Події',
    createLabel: 'Подію'
  },
  {
    tabValue: 'news',
    createId: 'news',
    slug: 'news',
    tabLabel: 'Новини',
    createLabel: 'Новину'
  },
  {
    tabValue: 'media',
    createId: 'media',
    slug: 'media',
    tabLabel: 'Ми у ЗМІ',
    createLabel: 'Ми у ЗМІ'
  }
];

export const PUBLICATIONS_TABS: ReadonlyArray<PublicationsTabConfig> = [
  { value: 'all', label: 'Всі', href: PUBLICATIONS_BASE_PATH },
  ...PUBLICATIONS_CATEGORIES.map(({ tabValue, tabLabel, slug, disabled }) => ({
    value: tabValue,
    label: tabLabel,
    href: `${PUBLICATIONS_BASE_PATH}/${slug}`,
    disabled
  }))
];

export const PUBLICATIONS_CREATE_OPTIONS: ReadonlyArray<PublicationsCreateOption> = PUBLICATIONS_CATEGORIES.map(
  ({ createId, createLabel, slug }) => ({
    id: createId,
    label: createLabel,
    href: `${PUBLICATIONS_BASE_PATH}/${slug}/create`
  })
);

const PUBLICATIONS_STATUS_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: BaseContentStatuses.Draft, label: 'Чернетка (прихована)' },
  { value: BaseContentStatuses.Published, label: 'Опублікована' },
];


export const PUBLICATIONS_FILTERS: ReadonlyArray<PublicationsFilterConfig> = [
  {
    id: 'status',
    label: 'Статус',
    options: PUBLICATIONS_STATUS_FILTER_OPTIONS,
    menuMinWidth: 170
  },
];

export type PublicationLanguageOption = Readonly<{
  locale: EditorLanguage;
  key: 'uk' | 'en';
  label: 'Українська' | 'Англійська';
}>;

export const LANGUAGE_OPTIONS: ReadonlyArray<PublicationLanguageOption> = [
  { locale: 'UA', key: 'uk', label: 'Українська' },
  { locale: 'EN', key: 'en', label: 'Англійська' }
] as const;

export const PublicationsChipLabels: Record<PublicationsItemType, string> = {
  news: 'Новина',
  events: 'Подія',
  media: 'Ми у ЗМІ'
} as const;

export enum MenuActionId {
  PUBLISH = 'PUBLISH',
  PUBLICATE_AND_EXIT = 'PUBLICATE_AND_EXIT',
  CANCEL_PUBLICATION = 'CANCEL_PUBLICATION',
  DELETE = 'DELETE'
} 



export type ACTIONS_TYPE = {
  id: MenuActionId;
  label: string;
};
export type MUTATION_RESULT = Record<string, string>;


export const CONTENT_MUTATION_RESULTS: MUTATION_RESULT = {
  publicationDeleted: 'Публікацію видалено',
  publicationUnpublished: 'Публікацію скасовано',
  publicationPublished: 'Публікацію опубліковано успішно',
  publicationPublishError: 'Виникла помилка при публікації. Спробуйте ще раз.',
  publicationUnpublishError: 'Виникла помилка при скасуванні публікації. Спробуйте ще раз.'
} as const;

export type MenuActionConfig = {
  status: BaseContentStatuses;
  toastMessage: string;
  toastErrorMessage: string;
};

export const MENU_ACTION_CONFIGS: Record<
  Exclude<MenuActionId, MenuActionId.DELETE>,
  MenuActionConfig
> = {
  [MenuActionId.PUBLISH]: {
    status: BaseContentStatuses.Published,
    toastMessage: CONTENT_MUTATION_RESULTS.publicationPublished,
    toastErrorMessage: CONTENT_MUTATION_RESULTS.publicationPublishError
  },
  [MenuActionId.PUBLICATE_AND_EXIT]: {
    status: BaseContentStatuses.Published,
    toastMessage: CONTENT_MUTATION_RESULTS.publicationPublished,
    toastErrorMessage: CONTENT_MUTATION_RESULTS.publicationPublishError
  },
  [MenuActionId.CANCEL_PUBLICATION]: {
    status: BaseContentStatuses.Draft,
    toastMessage: CONTENT_MUTATION_RESULTS.publicationUnpublished,
    toastErrorMessage: CONTENT_MUTATION_RESULTS.publicationUnpublishError
  },
} as const;


export const DEFAULT_EMPTY_DOCUMENT: SerializedContent = {
  blocks: [],
  version: CONTENT_VERSION,
  lastModified: new Date().toISOString()
};

export type LocalizedEditorState = {
  en?: {
    content: SerializedContent;
  };
  uk?: {
    content: SerializedContent;
  };
  __typename?: string;
};

export type EditorLanguage = 'EN' | 'UA';

export type MutationResponse<TData = unknown> = {
  data?: TData | null;
};

export type PublicationResource = (
  status: BaseContentStatuses,
  extra?: Record<string, unknown>
) => Promise<MutationResponse>;

export interface FetchedPublicationData {
  adminTitle?: string | null;
  newsDate?: string | null;
  publishedAt?: string | null;
  ticketUrl?: {
    uk?: string | null;
    en?: string | null;
  };
  eventDateTimeStart?: string | null;
  eventDateTimeEnd?: string | null;
  url?: string | null;
  title?: {
    uk?: string | null;
    en?: string | null;
  } | null;
  description?: {
    uk?: string | null;
    en?: string | null;
  } | null;
  keywords?: {
    uk?: string | null;
    en?: string | null;
  } | null;
  coverImage?: {
    src?: string | null;
    alt?: { uk?: string | null; en?: string | null } | null;
    crop?: CropRect | LocalizedCropRect | null;
  } | null;
  allowIndexation?: {
    uk?: boolean | null;
    en?: boolean | null;
  } | null;
}

export type ImageCropData = NonNullable<FetchedPublicationData['coverImage']>['crop'];

export const PAGE_TITLES: Record<PublicationsItemType, string> = {
  events: 'Події',
  news: 'Новини',
  media: 'Ми у ЗМІ'
} as const;

export const initialSeoValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '' },
    en: { title: '', description: '', keywords: '' }
  },
  ogImage: null,
  allowIndexing: { uk: true, en: true }
};

export const ADMIN_TITLE_LABELS: Record<PublicationsItemType, string> = {
  events: 'Назва події в адмінці',
  news: 'Назва новини в адмінці',
  media: 'Назва публікації в адмінці'
} as const;

export const META_TITLE_LENGTH = {
  min: 2,
  max: 150
};
export const META_DESCRIPTION_LENGTH = {
  min: 2,
  max: 250
};
export const META_KEYWORDS_LENGTH = {
  min: 2,
  max: 250
};
export const META_ALT_TEXT_LENGTH = {
  min: 2,
  max: 250
};

export const CROP_RATIOS = {
  HERO_BANNER: 816 / 300,
  FUNDATION_PROFILE_SMALL: 336 / 400,
  FUNDATION_PROFILE_BIG: 816 / 498,
  TEAM_AVATAR: 200 / 180,
  SOCIAL_MEDIA_PREVIEW: 295 / 225,
  CAROUSEL_BIG: 1080 / 742,
  FUNDATION_MAIN_FOUNDER: 744 / 454,
  GROUP_PHOTO: 16 / 9,
} as const;

