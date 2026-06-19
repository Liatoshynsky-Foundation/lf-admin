import { StateCreator } from 'zustand';

import { type NavigationState } from '../types';

export const createNavigationSlice: StateCreator<NavigationState> = (set) => ({
  dirtyPaths: {},
  setDirtyPath: (path, isDirty) =>
    set((state) => ({
      dirtyPaths: { ...state.dirtyPaths, [path]: isDirty }
    })),
  pendingNavigation: null,

  setPendingNavigation: (path) =>
    set(() => ({
      pendingNavigation: path
    })),
  isDiscardModalOpen: false,

  setDiscardModalOpen: (open) =>
    set(() => ({
      isDiscardModalOpen: open
    }))
});
