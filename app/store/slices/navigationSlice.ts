import { StateCreator } from 'zustand';

import { type NavigationState } from '../types';

export const createNavigationSlice: StateCreator<NavigationState> = (set) => ({
  dirtyPaths: {},
  setDirtyPath: (path, isDirty) =>
    set((state) => ({
      dirtyPaths: { ...state.dirtyPaths, [path]: isDirty }
    }))
});
