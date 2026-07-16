import { act, renderHook } from '@testing-library/react';

import { toSuggestionAudio, toSuggestionNote, useCompositionsForm } from './useCompositions';
import { OpusCompositionData, OpusCompositionSuggestion } from '~/types/opus';

jest.mock('~/shared/hooks/use-group-content/useGroupContent', () => ({
  createCompositionId: jest.fn(() => 'mocked-id')
}));

describe('useCompositions helpers', () => {
  it('toSuggestionAudio formats audio correctly', () => {
    const audio = { name: 'song.mp3', url: 'http://test.com/song.mp3' };
    expect(toSuggestionAudio(audio)).toEqual({
      id: 'mocked-id',
      name: 'song.mp3',
      fileUrl: 'http://test.com/song.mp3'
    });
  });

  it('toSuggestionNote formats note correctly', () => {
    const note = { name: '', url: 'http://test.com/score.pdf?token=123', publishDate: '2023-01-01' };
    expect(toSuggestionNote(note)).toEqual({
      id: 'mocked-id',
      name: 'score.pdf',
      fileUrl: 'http://test.com/score.pdf?token=123',
      publishDate: '2023-01-01'
    });
  });

  it('toSuggestionAudio handles missing url and missing name', () => {
    const audio = { name: undefined, url: undefined } as any;
    expect(toSuggestionAudio(audio)).toEqual({
      id: 'mocked-id',
      name: '',
      fileUrl: undefined
    });
  });

  it('toSuggestionNote handles missing publishDate and url', () => {
    const note = { name: 'Note without date', url: undefined, publishDate: undefined } as any;
    expect(toSuggestionNote(note)).toEqual({
      id: 'mocked-id',
      name: 'Note without date',
      fileUrl: undefined,
      publishDate: ''
    });
  });
});

describe('useCompositions Hook', () => {
  const mockOnChange = jest.fn();
  const defaultWorks: OpusCompositionData[] = [
    { id: '1', title: 'Симфонія №1', genre: '', year: '', audios: [], notes: [] },
    { id: '2', title: 'Соната', genre: '', year: '', audios: [], notes: [] }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a new empty composition', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.addComposition();
    });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks).toHaveLength(3);
    expect(updatedWorks[2].id).toBe('composition-1234567890');
    expect(updatedWorks[2].title).toBe('');
  });

  it('updates composition title', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.updateCompositionTitle('1', 'Нова Симфонія');
    });

    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks[0].title).toBe('Нова Симфонія');
  });

  it('fills composition data from partial suggestion', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    const suggestion: OpusCompositionSuggestion = {
      id: 'suggestion-partial',
      title: { en: 'English Title' },
      genre: undefined,
      year: null as unknown as number,
      audios: [{ name: 'CustomAudio.mp3', url: undefined }],
      sheetMusic: [{ name: 'CustomNote.pdf', url: 'test.com', publishDate: '2023-01-01' }]
    };

    act(() => {
      result.current.fillComposition(0, suggestion);
    });

    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks[0].title).toBe('English Title');
    expect(updatedWorks[0].genre).toBe('');
    expect(updatedWorks[0].audios[0].name).toBe('CustomAudio.mp3');
  });

  it('fills composition data with completely empty suggestion', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.fillComposition(0, { id: 'empty-id' } as OpusCompositionSuggestion);
    });

    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks[0].title).toBe('');
    expect(updatedWorks[0].audios).toEqual([]);
  });

  it('manages modal states for create and edit', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.openCreateModal(1);
    });
    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.modalMode).toBe('create');
    expect(result.current.editingIndex).toBe(1);

    act(() => {
      result.current.closeModal();
    });
    expect(result.current.isModalOpen).toBe(false);

    act(() => {
      result.current.openEditModal(0);
    });
    expect(result.current.modalMode).toBe('edit');
    expect(result.current.editingIndex).toBe(0);
  });

  it('handles modal submit to update existing composition', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.openEditModal(1);
    });

    act(() => {
      result.current.handleModalSubmit({ ...defaultWorks[1], title: 'Оновлено' });
    });

    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks[1].title).toBe('Оновлено');
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handles delete confirmation', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.setDeleteTargetId('1');
    });

    act(() => {
      result.current.handleDeleteConfirm();
    });

    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks).toHaveLength(1);
    expect(updatedWorks[0].id).toBe('2');
    expect(result.current.deleteTargetId).toBeNull();
  });

  it('fills composition data with full suggestion (uk title, year, genre)', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    const suggestion: OpusCompositionSuggestion = {
      id: 'sugg-full',
      title: { uk: 'Українська назва', en: 'English' },
      genre: 'Симфонія',
      year: 2024 
    };

    act(() => {
      result.current.fillComposition(0, suggestion);
    });

    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks[0].title).toBe('Українська назва');
    expect(updatedWorks[0].genre).toBe('Симфонія');
    expect(updatedWorks[0].year).toBe('2024');
  });

  it('handleModalSubmit does not mutate works if editingIndex is null', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.handleModalSubmit({ id: 'new-id', title: 'test', genre: '', year: '', audios: [], notes: [] });
    });

    const updatedWorks = mockOnChange.mock.calls[0][0];
    expect(updatedWorks).toEqual(defaultWorks);
    expect(result.current.isModalOpen).toBe(false);
  });

  it('handleDeleteConfirm does nothing if deleteTargetId is null', () => {
    const { result } = renderHook(() => useCompositionsForm(defaultWorks, mockOnChange));

    act(() => {
      result.current.handleDeleteConfirm();
    });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(result.current.deleteTargetId).toBeNull();
  });
});
