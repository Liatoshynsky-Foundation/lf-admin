import { JSONContent } from '@tiptap/react';

import { LocalizedJSON } from '~/types/common';
import { BlocksMap } from '~/types/store/pages';

export type ListPoint = { id: string; value: JSONContent };
export type List = (LocalizedJSON & {
  id: string;
})[]
export interface UsePointsListProps<K extends keyof BlocksMap> {
  blockId: K,
  setField: <F extends keyof BlocksMap[K]>(pageId: string, blockId: K, field: F, value: BlocksMap[K][F]) => void,
  listFieldName?: Extract<keyof BlocksMap[K], string>,
  list: List,
  currentLocale: 'uk' | 'en',
  pageId: string,
}

export const emptyDoc: JSONContent = { type: 'doc', content: [] };

export const usePointsList = <K extends keyof BlocksMap>({ list, setField, listFieldName = 'list' as Extract<keyof BlocksMap[K], string>, currentLocale, pageId, blockId }: UsePointsListProps<K>) => {

  const points: ListPoint[] = list.map((item) => ({
    id: item.id,
    value: item[currentLocale]
  }));

  const updatePoints = (newPoints: { id: string; value: JSONContent }[]) => {
    const updatedFullList = newPoints.map((newP) => {
      const originalItem = list.find((item) => item.id === newP.id);
      return {
        uk: emptyDoc,
        en: emptyDoc,
        ...originalItem,
        id: newP.id,
        [currentLocale]: newP.value
      };
    });
    setField(pageId, blockId, listFieldName, updatedFullList as BlocksMap[K][keyof BlocksMap[K]]);
  };

  const addPoint = () => {
    const newPoint = {
      id: crypto.randomUUID(),
      value: emptyDoc
    };
    updatePoints([...points, newPoint]);
  };

  const removePoint = (id: string) => {
    updatePoints(points.filter((point) => point.id !== id));
  };

  const updatePoint = (updated: {
    id: string;
    value: JSONContent;
  }) => {
    updatePoints(points.map((point) => (point.id === updated.id ? updated : point)));
  };

  return {
    addPoint,
    removePoint,
    updatePoint,
    points
  };
};