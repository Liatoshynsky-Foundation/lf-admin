import { BlocksMap } from '~/types/store/pages';

export type StoreState = AdminUserState & EditState;

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
  saveAsDraft: (pageId: string) => void;
  publishPage: (pageId: string) => void;
}

export type BlockData<K extends keyof BlocksMap = keyof BlocksMap> = BlocksMap[K];
