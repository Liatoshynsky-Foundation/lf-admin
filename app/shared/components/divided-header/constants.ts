export const PAGE_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
  SEO: 'seo'
} as const;

export type PageMode = (typeof PAGE_MODES)[keyof typeof PAGE_MODES];

export enum MenuActionId {
  PUBLISH_SEO = 'PUBLISH_SEO',
  PUBLISH_BOTH = 'PUBLISH_BOTH',
  PUBLISH_UA = 'PUBLISH_UA',
  PUBLISH_EN = 'PUBLISH_EN',
  SAVE_DRAFT = 'SAVE_DRAFT',
  SAVE_AND_EXIT = 'SAVE_AND_EXIT',
  DELETE_DRAFT = 'DELETE_DRAFT'
}

export const HEADER_MENU_OPTIONS = {
  seoPublish: [{ id: MenuActionId.PUBLISH_SEO, label: 'Опублікувати' }],
  newsPublish: [
    { id: MenuActionId.PUBLISH_BOTH, label: 'Опублікувати обидві версії' },
    { id: MenuActionId.PUBLISH_UA, label: 'Опублікувати UA версію' },
    { id: MenuActionId.PUBLISH_EN, label: 'Опублікувати EN версію' }
  ],
  baseActions: [
    { id: MenuActionId.SAVE_DRAFT, label: 'Зберегти зміни' },
    { id: MenuActionId.SAVE_AND_EXIT, label: 'Зберегти зміни і вийти' },
    { id: MenuActionId.DELETE_DRAFT, label: 'Видалити чернетку' } 
  ]
} as const;
