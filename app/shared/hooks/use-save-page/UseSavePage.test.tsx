import { act, renderHook } from '@testing-library/react';

import { useSavePageBlocks } from './UseSavePage';

const markSavedMock = jest.fn();
const mutateMock = jest.fn();
const useStoreMock = jest.fn();

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useMutation: () => [mutateMock, { loading: false, error: null, data: null }]
  };
});

jest.mock('~/store', () => ({
  useStore: (selector: (state: any) => unknown) => useStoreMock(selector)
}));

describe('useSavePageBlocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStoreMock.mockImplementation((selector) =>
      selector({ blocks: { 'about-us': { Intro: 'text' } }, isChanged: true, saveAsDraft: markSavedMock })
    );
  });

  it('should throw if no pageBlocks', async () => {
    useStoreMock.mockImplementation((selector) =>
      selector({ blocks: {}, isChanged: true, saveAsDraft: markSavedMock })
    );
    const { result } = renderHook(() => useSavePageBlocks('about-us'));
    await expect(result.current.save()).rejects.toThrow('No page blocks found');
  });

  it('should throw if not changed', async () => {
    useStoreMock.mockImplementation((selector) =>
      selector({ blocks: { 'about-us': {} }, isChanged: false, saveAsDraft: markSavedMock })
    );
    const { result } = renderHook(() => useSavePageBlocks('about-us'));
    await expect(result.current.save()).rejects.toThrow('Nothing to save');
  });

  it('should save and return updated page when mutate returns data', async () => {
    const updatedPage = { id: '1', slug: 'about-us', blocks: {} };
    mutateMock.mockResolvedValueOnce({ data: { updatePageBlocks: updatedPage } });
    const { result } = renderHook(() => useSavePageBlocks('about-us'));
    const res = await act(() => result.current.save());
    expect(mutateMock).toHaveBeenCalledWith({
      variables: { input: { slug: 'about-us', blocks: { Intro: 'text' } } }
    });
    expect(markSavedMock).toHaveBeenCalledWith('about-us');
    expect(res).toEqual(updatedPage);
  });

  it('should throw if mutate returns no updatePageBlocks', async () => {
    mutateMock.mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useSavePageBlocks('about-us'));
    await expect(result.current.save()).rejects.toThrow('Server did not return updated page');
  });

  it('should throw if mutate rejects', async () => {
    mutateMock.mockRejectedValueOnce(new Error('Network fail'));
    const { result } = renderHook(() => useSavePageBlocks('about-us'));
    await expect(result.current.save()).rejects.toThrow('Failed to save page blocks');
  });
});
