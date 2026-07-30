import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useCreateWorkAction } from './useCreateWorkAction';
import { COMPOSITION_MUTATION_RESULTS } from '~/constants/opus';
import { safeMutate } from '~/lib/utils/safeMutate';
import { useCreateCompositionMutation } from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('~/lib/utils/safeMutate', () => ({
  safeMutate: jest.fn(),
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useCreateCompositionMutation: jest.fn(),
}));

describe('useCreateWorkAction', () => {
  const MOCK_REFRESH = jest.fn();
  const MOCK_MUTATE = jest.fn();

  const MOCK_WORK_ID = 'composition-id-1';
  const MOCK_WORK_NAME = 'Symphony No. 5';
  const MOCK_SIMPLE_WORK_NAME = 'Simple Work';
  const MOCK_YEAR = '1808';
  const MOCK_GENRE = 'Classical';
  const MOCK_AUDIO_URL = 'http://audio.url';
  const MOCK_NOTE_URL = 'http://note.url';
  const MOCK_ERROR_MESSAGE = 'Не вдалося створити твір. Спробуйте ще раз.';

  const MOCK_WORK: OpusCompositionData = {
    id: MOCK_WORK_ID,
    name: MOCK_WORK_NAME,
    year: MOCK_YEAR,
    genre: MOCK_GENRE,
    audios: [{ id: '1', name: 'Audio 1', fileUrl: MOCK_AUDIO_URL }],
    notes: [{ id: '1', name: 'Note 1', fileUrl: MOCK_NOTE_URL, publishDate: MOCK_YEAR, isFree: true }],
  };

  const MOCK_WORK_EMPTY: OpusCompositionData = {
    id: 'composition-id-2',
    name: MOCK_SIMPLE_WORK_NAME,
    year: '',
    genre: '',
    audios: [],
    notes: [],
  };

  const MOCK_MAPPED_INPUT = {
    name: { uk: MOCK_WORK.name, en: MOCK_WORK.name },
    year: Number(MOCK_YEAR),
    genre: MOCK_WORK.genre,
    audioAvailable: true,
    sheetAvailable: true,
    audios: [{ name: 'Audio 1', url: MOCK_AUDIO_URL }],
    sheetMusic: [
      {
        name: 'Note 1',
        url: MOCK_NOTE_URL,
        publishDate: MOCK_YEAR,
        isFree: true,
        dateUploaded: expect.any(String),
      },
    ],
  };

  const MOCK_MAPPED_INPUT_EMPTY = {
    name: { uk: MOCK_WORK_EMPTY.name, en: MOCK_WORK_EMPTY.name },
    year: undefined,
    genre: undefined,
    audioAvailable: false,
    sheetAvailable: false,
    audios: [],
    sheetMusic: [],
  };

  const MOCK_WORK_WITH_PARTIAL_NOTES: OpusCompositionData = {
    id: 'composition-id-3',
    name: MOCK_WORK_NAME,
    year: MOCK_YEAR,
    genre: MOCK_GENRE,
    audios: [{ id: '1', name: 'Audio 1', fileUrl: '' }],
    notes: [
      {
        id: '1',
        name: 'Note without optionals',
        fileUrl: '',
        publishDate: '',
        isFree: undefined as unknown as boolean,
      },
    ],
  };

  const MOCK_MAPPED_INPUT_PARTIAL_NOTES = {
    name: { uk: MOCK_WORK_NAME, en: MOCK_WORK_NAME },
    year: Number(MOCK_YEAR),
    genre: MOCK_GENRE,
    audioAvailable: true,
    sheetAvailable: false,
    audios: [{ name: 'Audio 1', url: '' }],
    sheetMusic: [
      {
        name: 'Note without optionals',
        url: null,
        publishDate: '',
        isFree: false,
        dateUploaded: expect.any(String),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue({
      refresh: MOCK_REFRESH,
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
    });
    jest.mocked(useCreateCompositionMutation).mockReturnValue([MOCK_MUTATE, {}, jest.fn()] as unknown as ReturnType<typeof useCreateCompositionMutation>);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCreateWorkAction());

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should open modal and clear errors', () => {
    const { result } = renderHook(() => useCreateWorkAction());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should close modal when not submitting', () => {
    const { result } = renderHook(() => useCreateWorkAction());

    act(() => {
      result.current.openModal();
    });
    expect(result.current.isModalOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });
    expect(result.current.isModalOpen).toBe(false);
  });

  it('should not close modal when submitting', async () => {
    jest.mocked(safeMutate).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCreateWorkAction());

    act(() => {
      result.current.openModal();
    });

    act(() => {
      void result.current.handleSubmit(MOCK_WORK);
    });

    expect(result.current.isSubmitting).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isModalOpen).toBe(true);
  });
  
  it('should handle successful work creation', async () => {
    jest.mocked(safeMutate).mockResolvedValueOnce({ data: {} } as Awaited<ReturnType<typeof safeMutate>>);
    const { result } = renderHook(() => useCreateWorkAction());

    await act(async () => {
      await result.current.handleSubmit(MOCK_WORK);
    });

    expect(safeMutate).toHaveBeenCalledWith(
      MOCK_MUTATE,
      { input: MOCK_MAPPED_INPUT },
      expect.any(String),
      expect.any(String)
    );
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(MOCK_REFRESH).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(COMPOSITION_MUTATION_RESULTS.created);
  });

  it('should handle failed work creation', async () => {
    jest.mocked(safeMutate).mockResolvedValueOnce(undefined as unknown as Awaited<ReturnType<typeof safeMutate>>);
    const { result } = renderHook(() => useCreateWorkAction());

    await act(async () => {
      await result.current.handleSubmit(MOCK_WORK_EMPTY);
    });

    expect(safeMutate).toHaveBeenCalledWith(
      MOCK_MUTATE,
      { input: MOCK_MAPPED_INPUT_EMPTY },
      expect.any(String),
      expect.any(String)
    );
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBe(MOCK_ERROR_MESSAGE);
    expect(MOCK_REFRESH).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(COMPOSITION_MUTATION_RESULTS.failed);
  });

  it('should correctly fallback optional fields in audios and sheetMusic mapping', async () => {
    jest.mocked(safeMutate).mockResolvedValueOnce({ data: {} } as Awaited<ReturnType<typeof safeMutate>>);
    const { result } = renderHook(() => useCreateWorkAction());

    await act(async () => {
      await result.current.handleSubmit(MOCK_WORK_WITH_PARTIAL_NOTES);
    });

    expect(safeMutate).toHaveBeenCalledWith(
      MOCK_MUTATE,
      { input: MOCK_MAPPED_INPUT_PARTIAL_NOTES },
      expect.any(String),
      expect.any(String)
    );
  });
});