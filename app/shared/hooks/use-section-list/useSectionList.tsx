import { JSONContent } from '@tiptap/react';

import { ensureIds } from '~/lib/utils/ensureIds';
import { useStore } from '~/store';
import { LocalizedJSON } from '~/types/common';
import { BlocksMap } from '~/types/store/pages';


interface UseSectionListProps<K extends keyof BlocksMap> {
  blockId: K,
  setField: <F extends keyof BlocksMap[K]>(pageId: string, blockId: K, field: F, value: BlocksMap[K][F]) => void,
  sectionsList: {
    id: string;
    subtitle: LocalizedJSON;
    list: LocalizedJSON[];
  }[],
  pageId: string,
  currentLocale: 'uk' | 'en',
}


export const useSectionList = <K extends keyof BlocksMap>({ pageId, blockId, sectionsList, currentLocale }: UseSectionListProps<K>) => {
  const emptyDoc: JSONContent = { type: 'doc', content: [] };
  const setField = useStore((state) => state.setField);
  const sections = sectionsList.map((item) => ({
    id: item.id,
    title: item.subtitle[currentLocale],
    points: ensureIds(item.list)
  }));
  const handleUpdateSectionList = (sectionId: string, newPoints: {
    id: string;
    uk: JSONContent;
    en: JSONContent;
  }[]) => {
    const updatedSection = sectionsList.find((s) => s.id === sectionId);

    if (!updatedSection) return;

    const newSections = sectionsList.map((section) =>
      section.id === sectionId ? { ...section, list: newPoints } : section);

    setField(pageId, blockId, 'sections', newSections as BlocksMap[K][keyof BlocksMap[K]]);
  };

  const handleChangeSectionListPoint = (sectionId: string, updatedPoint: {
    id: string;
    uk: JSONContent;
    en: JSONContent;
  }) => {
    const currentSection = sections.find(s => s.id === sectionId);

    if (!currentSection) return;
    const currentPoints = currentSection.points;
    const newPoints = currentPoints.map((p) =>
      p.id === updatedPoint.id ? updatedPoint : p
    );
    handleUpdateSectionList(sectionId, newPoints);
  };

  const handleAddSectionListPoint = (sectionId: string) => {
    const currentSection = sections.find(s => s.id === sectionId);

    const currentPoints = currentSection?.points || [];
    const newPoint = { id: crypto.randomUUID(), uk: emptyDoc, en: emptyDoc };
    const newPoints = [...currentPoints, newPoint];

    handleUpdateSectionList(sectionId, newPoints);

    return newPoint;
  };

  const handleDeleteSectionListPoint = (sectionId: string, pointId: string) => {
    const currentSection = sections.find(s => s.id === sectionId);

    if (!currentSection) return;

    const currentPoints = currentSection.points;
    const newPoints = currentPoints.filter((point) => point.id !== pointId);

    handleUpdateSectionList(sectionId, newPoints);
  };

  return {
    sections,
    addListPoint: handleAddSectionListPoint,
    removeListPoint: handleDeleteSectionListPoint,
    updateListPoint: handleChangeSectionListPoint
  };
};

