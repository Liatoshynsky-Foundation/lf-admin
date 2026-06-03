import { JSONContent } from '@tiptap/react';

import { LocalizedJSON } from '~/types/common';

export const usePointsList = ({ list, setField, currentLocale, pageId, blockId }: {
    list: (LocalizedJSON & {
        id: string;
    })[], 
    setField, 
    currentLocale: 'uk' | 'en', 
    pageId: string, 
    blockId: string
}) => {
  const emptyDoc: JSONContent = { type: 'doc', content: [] };
  
  const points = list.map((item) => ({
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
    setField(pageId, blockId, 'list', updatedFullList);
  };

  const addPoint = () => {
    const newPoint = {
      id: crypto.randomUUID(),
      value: emptyDoc
    };
    updatePoints([...points, newPoint]);
    return newPoint;
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