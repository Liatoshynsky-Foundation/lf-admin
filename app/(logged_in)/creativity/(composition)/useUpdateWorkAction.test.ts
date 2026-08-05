import { act,renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useUpdateWorkAction } from './useUpdateWorkAction';
import {
  PaginatedWorksDocument,
  useUpdateCompositionMutation
} from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  PaginatedWorksDocument: 'PaginatedWorksDocument',
  useUpdateCompositionMutation: jest.fn()
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseUpdateCompositionMutation = useUpdateCompositionMutation as jest.MockedFunction<
  typeof useUpdateCompositionMutation
>;

describe('useUpdateWorkAction', () => {
  const mockRefresh = jest.fn<void, []>();
  const mockUpdateCompositionMut = jest.fn();

  const mockComposition: OpusCompositionData = {
	  name: 'Symphony No. 5',
	  year: '1808',
	  genre: 'Symphony',
	  audios: [
		  {
			  name: ' Movement 1 ',
			  fileUrl: 'http://example.com/audio1.mp3',
			  id: ''
		  }
	  ],
	  notes: [
		  {
			  name: ' Full Score ',
			  fileUrl: 'http://example.com/score.pdf',
			  publishDate: ' 1808-12-22 ',
			  id: ''
		  }
	  ],
	  id: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      refresh: mockRefresh,
      back: jest.fn(),
      forward: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    });
    mockUseUpdateCompositionMutation.mockReturnValue([
      mockUpdateCompositionMut,
      { loading: false, data: undefined, reset: jest.fn(), called: false, client: {} as never }
    ]);
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useUpdateWorkAction());

    expect(result.current.isUpdating).toBe(false);
    expect(typeof result.current.handleUpdateComposition).toBe('function');
  });

  it('should handle composition update successfully with full data', async () => {
    mockUpdateCompositionMut.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useUpdateWorkAction());

    await act(async () => {
      await result.current.handleUpdateComposition('comp-123', mockComposition);
    });

    expect(mockUpdateCompositionMut).toHaveBeenCalledWith({
      variables: {
        id: 'comp-123',
        input: {
          name: { uk: 'Symphony No. 5', en: 'Symphony No. 5' },
          year: 1808,
          genre: 'Symphony',
          audioAvailable: true,
          sheetAvailable: true,
          audios: [
            {
              name: 'Movement 1',
              url: 'http://example.com/audio1.mp3'
            }
          ],
          sheetMusic: [
            {
              name: 'Full Score',
              url: 'http://example.com/score.pdf',
              publishDate: '1808-12-22',
              isFree: false,
              dateUploaded: expect.any(String)
            }
          ]
        }
      },
      refetchQueries: [PaginatedWorksDocument],
      awaitRefetchQueries: true
    });

    expect(toast.success).toHaveBeenCalledWith('Твір успішно оновлено');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('should map empty optional fields correctly when updating', async () => {
    mockUpdateCompositionMut.mockResolvedValueOnce({ data: {} });

    const minimalComposition: OpusCompositionData = {
      name: 'Sonata',
      year: '   ',
      genre: '   ',
      audios: [],
      notes: [
        {
          name: undefined,
          fileUrl: undefined,
          publishDate: '   ',
          id: ''
        }
      ],
      id: ''
    };

    const { result } = renderHook(() => useUpdateWorkAction());

    await act(async () => {
      await result.current.handleUpdateComposition('comp-456', minimalComposition);
    });

    expect(mockUpdateCompositionMut).toHaveBeenCalledWith({
      variables: {
        id: 'comp-456',
        input: {
          name: { uk: 'Sonata', en: 'Sonata' },
          year: undefined,
          genre: undefined,
          audioAvailable: false,
          sheetAvailable: false,
          audios: [],
          sheetMusic: [
            {
              name: '',
              url: undefined,
              publishDate: undefined,
              isFree: false,
              dateUploaded: expect.any(String)
            }
          ]
        }
      },
      refetchQueries: [PaginatedWorksDocument],
      awaitRefetchQueries: true
    });
  });

  it('should handle composition update error and throw', async () => {
    const mockError = new Error('Update failed');
    mockUpdateCompositionMut.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useUpdateWorkAction());

    await act(async () => {
      await expect(
        result.current.handleUpdateComposition('comp-123', mockComposition)
      ).rejects.toThrow('Update failed');
    });

    expect(toast.error).toHaveBeenCalledWith('Помилка при оновленні твору');
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('should reflect loading state from mutation hook', () => {
    mockUseUpdateCompositionMutation.mockReturnValue([
      mockUpdateCompositionMut,
      { loading: true, data: undefined, reset: jest.fn(), called: true, client: {} as never }
    ]);

    const { result } = renderHook(() => useUpdateWorkAction());

    expect(result.current.isUpdating).toBe(true);
  });
});