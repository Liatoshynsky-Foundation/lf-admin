import { act, renderHook } from '@testing-library/react';

import { emptyDoc, List, usePointsList } from './usePointsList';

const mockSetField = jest.fn();
const initialList: List = [{ id: '1', en: emptyDoc, uk: emptyDoc }, { id: '2', en: emptyDoc, uk: emptyDoc }];
const pageId = 'page-1';
const blockId = 'block-1';
const currentLocale = 'uk' as const;

const defaultMockedProps = {
  blockId,
  list: initialList,
  setField: mockSetField,
  currentLocale,
  pageId
};


describe('usePointsList', () => {
  it('should initialize points array with id and currentLocale value', () => {
    const { result } = renderHook(() => usePointsList(defaultMockedProps));
    expect(result.current.points).toEqual([
      { id: '1', value: emptyDoc },
      { id: '2', value: emptyDoc },
    ]);
  });

  it('should call setField with a new list when addPoint is called', () => {
    const { result } = renderHook(() => usePointsList(defaultMockedProps));

    let createdPoint;

    act(() => {
      createdPoint = result.current.addPoint();
    });

    const expectedList = [...initialList, {
      id: 'uuid-1',
      uk: emptyDoc,
      en: emptyDoc,
    }];

    expect(createdPoint).toStrictEqual({
      id: 'uuid-1',
      value: emptyDoc
    });

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'list', expectedList);
  });

  it('should call setField with a filtered list when removePoint is called', () => {
    const { result } = renderHook(() => usePointsList(defaultMockedProps));
    const deleteId = initialList[0].id;

    act(() => {
      result.current.removePoint(deleteId);
    });

    const filteredList = initialList.filter((point) => point.id !== deleteId);
    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'list', filteredList);
  });
  it('should call setField with correct points when updatePoint is called', () => {
    const { result } = renderHook(() => usePointsList(defaultMockedProps));

    const newContent = { type: 'doc', content: [{ type: 'text', text: 'Привіт' }] };
    const updatePayload = { id: '1', value: newContent };

    act(() => {
      result.current.updatePoint(updatePayload);
    });

    const expectedList = initialList.map((point) => (point.id === updatePayload.id ? { ...point, [currentLocale]: newContent } : point));

    expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'list', expectedList);

  });
});
