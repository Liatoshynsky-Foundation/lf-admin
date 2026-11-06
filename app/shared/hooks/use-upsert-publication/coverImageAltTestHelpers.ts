import { act, renderHook } from '@testing-library/react';

import type { LocalizedString } from '~/types/localization';

type CoverImageAltSave = (id: string, alt: LocalizedString) => Promise<unknown>;

type CoverImageAltAutosaveTestOptions = {
  useSaveHook: () => readonly [CoverImageAltSave, unknown];
  mockSafeMutate: jest.Mock;
  staleResult: Promise<unknown>;
  latestResult: Promise<unknown>;
};

export const addCoverImageAltAutosaveTests = ({
  useSaveHook,
  mockSafeMutate,
  staleResult,
  latestResult
}: CoverImageAltAutosaveTestOptions) => {
  it('ignores stale cover alt save results', async () => {
    mockSafeMutate.mockReturnValueOnce(staleResult).mockReturnValueOnce(latestResult);

    const { result } = renderHook(useSaveHook);
    const [save] = result.current;
    let staleSave: Promise<unknown>;
    let latestSave: Promise<unknown>;

    await act(async () => {
      staleSave = save('id1', { uk: 'aa', en: 'aa' });
      latestSave = save('id2', { uk: 'aa', en: 'aa' });
      await Promise.all([staleSave, latestSave]);
    });

    expect(await staleSave!).toBeUndefined();
    expect(await latestSave!).toBe(await latestResult);
  });
};
