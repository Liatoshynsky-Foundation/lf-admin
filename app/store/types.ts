import { BlocksMap } from '~/types/store/pages';

export type StoreState = AdminUserState & EditState & NavigationState;

export interface Admin {
  email: string;
  canEdit: boolean;
}

export interface AdminUserState {
  email: string;
  isLoggedIn: boolean;
  canEdit: boolean;
  isSuperAdmin: boolean;

  admins: Admin[];

  login: (data: { email: string; canEdit: boolean; isSuperAdmin: boolean }) => void;
  logout: () => void;

  addAdmin: (admin: Admin) => void;
  removeAdmin: (email: string) => void;
  updateAdminPermission: (email: string, canEdit: boolean) => void;
}

export interface EditState {
  isChanged: boolean;
  isInitialized: boolean;

  blocks: {
    [pageId: string]: {
      [blockId in keyof BlocksMap]?: BlocksMap[blockId];
    };
  };

  originalBlocks: {
    [pageId: string]: {
      [blockId in keyof BlocksMap]?: BlocksMap[blockId];
    };
  };

  blocksOrder: {
    [pageId: string]: string[]
  }

  originalBlocksOrder: {
    [pageId: string]: string[]
  }

  locale: 'uk' | 'en';
  setLocale: (locale: 'uk' | 'en') => void;
  setField: <P extends string, K extends keyof BlocksMap, F extends keyof BlocksMap[K]>(
    pageId: P,
    blockId: K,
    field: F,
    value: BlocksMap[K][F]
  ) => void;
  setFields: <P extends string, K extends keyof BlocksMap>(
    pageId: P,
    blockId: K,
    data: Partial<BlocksMap[K]>,
    isInit?: boolean
  ) => void;
  setPageData: <T extends Record<string, BlockData>>(pageId: string, blocks: T, blocksOrder: string[], isInit?: boolean) => void;
  setBlocksOrder: (pageId: string, blocksOrder: string[]) => void;
  saveAsDraft: (pageId: string) => void;
  publishPage: (pageId: string) => void;
  discardChanges: (pageId: string) => void;
}

export interface NavigationState {
  dirtyPaths: Record<string, boolean>;
  setDirtyPath: (path: string, isDirty: boolean) => void;
}


export type BlockData<K extends keyof BlocksMap = keyof BlocksMap> = BlocksMap[K];
