import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { emptyDoc } from '../use-points-list/usePointsList';
import { useSectionList } from './useSectionList';
import { ensureIds } from '~/lib/utils/ensureIds';
import { mockSetField } from '~/shared/components/privacy-policy/__mocks__/setup-mocks';


const inputSectionsList = [
  { id: '1', subtitle: { uk: emptyDoc, en: emptyDoc }, list: [{ id: 'point-1', uk: emptyDoc, en: emptyDoc }] },
  { id: '2', subtitle: { uk: emptyDoc, en: emptyDoc }, list: [{ id: 'point-2', uk: emptyDoc, en: emptyDoc }] }
];

const pageId = 'page-1';
const blockId = 'block-1' as any;
const currentLocale = 'uk' as const;

const sectionIdMocked = '1';

const defaultMockedProps = {
  blockId,
  sectionsList: inputSectionsList,
  setField: mockSetField,
  currentLocale,
  pageId
};

const sections = inputSectionsList.map((sl) => ({
  id: sl.id,
  title: sl.subtitle[currentLocale],
  points: ensureIds(sl.list),
}));

describe('useSectionList', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });
  it('should initalize sections with correct structure', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));


    expect(result.current.sections).toEqual(sections);
  });

  it('should call setField with with correct updatedPoint & sectionId when updateListPoint is called', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    const updatedPoint = {
      id: 'point-1',
      uk: { type: 'doc', content: [{ type: 'text', text: 'Updated text' }] },
      en: { type: 'doc', content: [] }
    };
    const expectedNewSections = inputSectionsList.map((section) => {
      if (section.id === sectionIdMocked) {
        return {
          ...section,
          list: section.list.map((p) => p.id === updatedPoint.id ? updatedPoint : p)
        };
      }
      return section;
    });

    act(() => {
      result.current.updateListPoint(sectionIdMocked, updatedPoint);
    });

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'sections', expectedNewSections);
  });

  it('should call setField with with correct sectionId when addListPoint is called', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    const newPoint = { en: { type: 'doc', content: [] }, uk: { type: 'doc', content: [] } };

    const expectedNewSections = inputSectionsList.map((section) => {
      if (section.id === sectionIdMocked) {
        return {
          ...section,
          list: [...section.list, { id: 'uuid-1', ...newPoint }]
        };
      }
      return section;
    });

    act(() => {
      result.current.addListPoint(sectionIdMocked);
    });

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'sections',
      expectedNewSections
    );
  });

  it('should call setField with with correct sectionId & pointId when removeListPoint is called', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    const pointDeleteId = 'point-1';

    const expectedNewSections = inputSectionsList.map((section) => {
      if (section.id === sectionIdMocked) {
        return {
          ...section,
          list: section.list.filter((p) => p.id !== pointDeleteId)
        };
      }
      return section;
    });
    act(() => {
      result.current.removeListPoint(sectionIdMocked, pointDeleteId);
    });

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'sections', expectedNewSections);
  });
});
