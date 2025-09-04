'use client';
import getFromPath from '~/lib/utils/getFromPath';
import { useStore } from '~/store';

export function useHasUnsavedChanges(currentRoute: string) {
  const isChanged = useStore((state) => state.isChanged);
  const blocks = useStore((state) => state.blocks);
  const nameFromPath = getFromPath(currentRoute);
  return isChanged && Object.keys(blocks).length > 0 ? blocks.hasOwnProperty(nameFromPath as PropertyKey) : false;
}
