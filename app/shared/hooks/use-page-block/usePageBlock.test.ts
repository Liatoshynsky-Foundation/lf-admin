import { renderHook } from '@testing-library/react';

import { usePageBlock } from './usePageBlock';
import { useStore } from '~/store';

jest.mock('~/store');

const useStoreMock = useStore as unknown as jest.Mock;

describe('usePageBlock hook', () => {
  const blocksMock = { testPage: { IntroSection: { title: 'test' } } };

  type MockState = {
    blocks: typeof blocksMock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useStoreMock.mockImplementation((selector: (state: MockState) => unknown) =>
      selector({
        blocks: blocksMock
      })
    );
  });

  it('should select and return the correct block from the store', () => {
    const { result } = renderHook(() => usePageBlock('testPage', 'IntroSection'));

    expect(result.current.block).toEqual(blocksMock.testPage.IntroSection);
  });

  it('should return undefined if the page or block does not exist', () => {
    const { result } = renderHook(() => usePageBlock('nonExistentPage', 'IntroSection' as any));

    expect(result.current.block).toBeUndefined();
  });
});
