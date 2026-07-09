import { renderHook } from '@testing-library/react';

import { useAllCompositions } from './useCompositions';

const mockUseAllCompositionsQuery = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  useAllCompositionsQuery: (options: unknown) => mockUseAllCompositionsQuery(options)
}));

describe('useCompositions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAllCompositionsQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    });
  });

  it('requests standalone compositions', () => {
    renderHook(() => useAllCompositions({}));

    expect(mockUseAllCompositionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          filters: {
            isStandalone: true
          }
        },
        fetchPolicy: 'network-only',
        skip: undefined
      })
    );
  });

  it('passes skip option', () => {
    renderHook(() => useAllCompositions(undefined, { skip: true }));

    expect(mockUseAllCompositionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: true
      })
    );
  });
});
