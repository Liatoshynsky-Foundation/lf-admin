'use client';

import { useStore } from '~/store';

export function useHasUnsavedChanges(currentRoute: string) {
  const dirtyPaths = useStore((state) => state.dirtyPaths);

  return dirtyPaths[currentRoute] ?? false;
}
