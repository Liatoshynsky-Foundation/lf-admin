export enum MenuActionId {
  PUBLISH_SEO = 'PUBLISH_SEO',
  PUBLISH_BOTH = 'PUBLISH_BOTH',
  PUBLISH_UA = 'PUBLISH_UA',
  PUBLISH_EN = 'PUBLISH_EN',
  SAVE_DRAFT = 'SAVE_DRAFT',
  SAVE_AND_EXIT = 'SAVE_AND_EXIT',
  DELETE_DRAFT = 'DELETE_DRAFT'
}

export type ACTIONS_TYPE = {
    id: keyof typeof MenuActionId;
    label: string
}

export type HEADER_MENU_OPTIONS_TYPE = Record<string, ReadonlyArray<ACTIONS_TYPE>> 

export const HEADER_MENU_OPTIONS: HEADER_MENU_OPTIONS_TYPE = {
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
