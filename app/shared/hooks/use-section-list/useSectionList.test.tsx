import { act, renderHook } from '@testing-library/react';

import { emptyDoc } from '../use-points-list/usePointsList';
import { useSectionList } from './useSectionList';
import { ensureIds } from '~/lib/utils/ensureIds';
import { mockSetField } from '~/shared/components/privacy-policy/__mocks__/setup-mocks';

beforeAll(() => {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'uuid-1'
    },
    writable: true,
    configurable: true
  });
});

const inputSectionsList = [
  {
    id: '1',
    subtitle: { uk: emptyDoc, en: emptyDoc },
    list: [
      { id: 'point-1', uk: emptyDoc, en: emptyDoc },
      { id: 'point-1-other', uk: emptyDoc, en: emptyDoc }
    ]
  },
  { id: '2', subtitle: { uk: emptyDoc, en: emptyDoc }, list: [{ id: 'point-2', uk: emptyDoc, en: emptyDoc }] }
];

const pageId = 'page-1';
const blockId = 'block-1' as string;
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
  points: ensureIds(sl.list)
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
          list: section.list.map((p) => (p.id === updatedPoint.id ? updatedPoint : p))
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

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'sections', expectedNewSections);
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

  it('should call setField with correct updated sections when updateSectionSubtitle is called', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    const newSubtitle = { type: 'doc', content: [{ type: 'text', text: 'New Subtitle' }] };

    const expectedNewSections = inputSectionsList.map((section) => {
      if (section.id === sectionIdMocked) {
        return {
          ...section,
          subtitle: { ...section.subtitle, uk: newSubtitle }
        };
      }
      return section;
    });

    act(() => {
      result.current.updateSectionSubtitle(sectionIdMocked, newSubtitle);
    });

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'sections', expectedNewSections);
  });

  it('should call setField with correct updated sections when updateSectionList is called', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    const newPoints = [{ id: 'point-1-new', uk: emptyDoc, en: emptyDoc }];

    const expectedNewSections = inputSectionsList.map((section) => {
      if (section.id === sectionIdMocked) {
        return {
          ...section,
          list: newPoints
        };
      }
      return section;
    });

    act(() => {
      result.current.updateSectionList(sectionIdMocked, newPoints);
    });

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'sections', expectedNewSections);
  });

  it('should return early and not call setField when updateListPoint is called with invalid sectionId', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    act(() => {
      result.current.updateListPoint('non-existent', { id: 'point-1', uk: emptyDoc, en: emptyDoc });
    });
    expect(mockSetField).not.toHaveBeenCalled();
  });

  it('should return early and not call setField when removeListPoint is called with invalid sectionId', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    act(() => {
      result.current.removeListPoint('non-existent', 'point-1');
    });
    expect(mockSetField).not.toHaveBeenCalled();
  });

  it('should return early and not call setField when updateSectionList is called with invalid sectionId', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    act(() => {
      result.current.updateSectionList('non-existent', []);
    });
    expect(mockSetField).not.toHaveBeenCalled();
  });

  it('should return early and not call setField when addListPoint is called with invalid sectionId', () => {
    const { result } = renderHook(() => useSectionList(defaultMockedProps));
    act(() => {
      result.current.addListPoint('non-existent');
    });
    expect(mockSetField).not.toHaveBeenCalled();
  });
});
