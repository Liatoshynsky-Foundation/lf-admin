import { create } from 'zustand';

import { createAdminSlice } from './slices/adminSlice';
import { createEditSlice } from './slices/editSlice';
import type { StoreState } from './types';

export const useStore = create<StoreState>()((...a) => ({
  ...createAdminSlice(...a),
  ...createEditSlice(...a)
}));
