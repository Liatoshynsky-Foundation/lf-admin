import { JSONContent } from '@tiptap/react';

import { ensureIds } from '~/lib/utils/ensureIds';
import { LocalizedJSON } from '~/types/common';
import { BlocksMap } from '~/types/store/pages';

type BlockIdsWithSections = {
  [K in keyof BlocksMap]: 'sections' extends keyof BlocksMap[K] ? K : never;
}[keyof BlocksMap]

interface UseSectionListProps<K extends BlockIdsWithSections> {
  blockId: K,
  sectionsList: {
    id: string;
    subtitle: LocalizedJSON;
    list: LocalizedJSON[];
  }[],
  setField: <F extends keyof BlocksMap[K]>(pageId: string, blockId: K, field: F, value: BlocksMap[K][F]) => void,
  pageId: string,
  currentLocale: 'uk' | 'en',
}


export const useSectionList = <K extends BlockIdsWithSections>({ pageId, blockId, setField, sectionsList, currentLocale }: UseSectionListProps<K>) => {
  const emptyDoc: JSONContent = { type: 'doc', content: [] };

  const sections = sectionsList.map((item) => ({
    id: item.id,
    title: item.subtitle[currentLocale],
    points: ensureIds(item.list)
  }));

  const handleUpdateSectionList = (sectionId: string, newPoints: Array<LocalizedJSON & { id: string }>) => {
    const updatedSection = sectionsList.find((s) => s.id === sectionId);

    if (!updatedSection) return;

    const newSections = sectionsList.map((section) =>
      section.id === sectionId ? { ...section, list: newPoints } : section);

    setField(pageId, blockId, 'sections', newSections);
  };

  const handleChangeSectionListPoint = (sectionId: string, updatedPoint: LocalizedJSON & { id: string }) => {
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
  };

  const handleDeleteSectionListPoint = (sectionId: string, pointId: string) => {
    const currentSection = sections.find(s => s.id === sectionId);

    if (!currentSection) return;

    const currentPoints = currentSection.points;
    const newPoints = currentPoints.filter((point) => point.id !== pointId);

    handleUpdateSectionList(sectionId, newPoints);
  };

  const handleChangeSectionSubtitle = (sectionId: string, value: JSONContent) => {
    const updatedSections = sectionsList.map((section) =>
      section.id === sectionId
        ? { ...section, subtitle: { ...section.subtitle, [currentLocale]: value } }
        : section
    );
    setField(pageId, blockId, 'sections', updatedSections);
  };

  return {
    sections,
    addListPoint: handleAddSectionListPoint,
    removeListPoint: handleDeleteSectionListPoint,
    updateListPoint: handleChangeSectionListPoint,
    updateSectionSubtitle: handleChangeSectionSubtitle,
    updateSectionList: handleUpdateSectionList,
  };
};

