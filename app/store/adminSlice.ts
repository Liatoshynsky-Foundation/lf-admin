import { create } from 'zustand';

import { AdminUserState, createAdminSlice } from './store';

create<AdminUserState>()((...a) => ({
  ...createAdminSlice(...a)
}));
