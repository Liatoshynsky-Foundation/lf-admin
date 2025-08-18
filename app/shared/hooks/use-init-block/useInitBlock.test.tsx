import { renderHook } from '@testing-library/react';

import { useStore } from '../../../store';
import useInitBlock from './useInitBlock';
import { BlocksMap } from '~/types/store/pages';

jest.mock('../../../store', () => ({
  useStore: jest.fn()
}));

const mockedUseStore = useStore as unknown as jest.Mock;

describe('useInitBlock', () => {
  const mockSetFields = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an existing block if it exists in the store', () => {
    const existingBlock = { title: 'Test Block' } as BlocksMap[keyof BlocksMap];

    mockedUseStore.mockImplementation((selector) =>
      selector({
        blocks: { page1: { header: existingBlock } },
        setFields: mockSetFields
      })
    );

    const { result } = renderHook(() =>
      useInitBlock('page1', 'header' as keyof BlocksMap, { title: 'Init' } as BlocksMap[keyof BlocksMap])
    );

    expect(result.current).toEqual(existingBlock);
    expect(mockSetFields).not.toHaveBeenCalled();
  });

  it('should call setFields if the block is not present', () => {
    const initialData = { title: 'Init Block' } as BlocksMap[keyof BlocksMap];

    mockedUseStore.mockImplementation((selector) =>
      selector({
        blocks: {},
        setFields: mockSetFields
      })
    );

    renderHook(() => useInitBlock('page1', 'header' as keyof BlocksMap, initialData));

    expect(mockSetFields).toHaveBeenCalledWith('page1', 'header', initialData, true);
  });

  it('should return initialData if there is no block', () => {
    const initialData = { title: 'Init Block' } as BlocksMap[keyof BlocksMap];

    mockedUseStore.mockImplementation((selector) =>
      selector({
        blocks: {},
        setFields: mockSetFields
      })
    );

    const { result } = renderHook(() => useInitBlock('page1', 'header' as keyof BlocksMap, initialData));

    expect(result.current).toEqual(initialData);
  });
});
