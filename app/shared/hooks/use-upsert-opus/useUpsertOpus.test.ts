import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { createCompositionId, toCompositionInput,useUpsertOpus } from './useUpsertOpus';
import {
  COMPOSITION_DUPLICATE_ERROR,
  COMPOSITION_NAME_REQUIRED_ERROR,
  COMPOSITION_REQUIRED_FIELDS_ERROR,
  COMPOSITION_VALIDATION_MESSAGES,
  OPUS_VALIDATION_MESSAGES
} from '~/constants/opus';
import {
  META_ALT_TEXT_LENGTH,
  META_DESCRIPTION_LENGTH,
  META_KEYWORDS_LENGTH,
  META_TITLE_LENGTH
} from '~/constants/publications';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { FetchedOpusData, OpusCompositionData } from '~/types/opus';

interface OpusByIdResult {
  data?: { opusById: FetchedOpusData | null } | null;
  loading: boolean;
}

const mockCreateOpus = jest.fn();
const mockUpdateOpus = jest.fn();
let mockOpusByIdResult: OpusByIdResult;

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/shared/hooks/use-opuses/useOpuses', () => ({
  useCreateOpus: () => [mockCreateOpus],
  useUpdateOpus: () => [mockUpdateOpus],
  useOpusById: () => mockOpusByIdResult
}));

const fullFetchedOpus: FetchedOpusData = {
  id: 'opus-1',
  numberKind: 'sineop',
  number: 42,
  name: { uk: 'Симфонія', en: 'Symphony' },
  additionalText: 'Примітка',
  creationYear: '1921',
  endYear: '1923',
  datesNote: 'Уточнення',
  genre: { uk: 'Симфонія', en: 'Symphony' },
  title: { uk: 'UK title', en: 'EN title' },
  description: { uk: 'UK desc', en: 'EN desc' },
  keywords: { uk: 'UK kw', en: 'EN kw' },
  allowIndexation: { uk: false, en: false },
  coverImage: {
    src: 'https://cdn/image.png',
    alt: { uk: 'alt uk', en: 'alt en' },
    crop: { x: 1, y: 2, width: 3, height: 4 }
  },
  compositions: [
    {
      id: 'comp-1',
      name: { uk: 'Твір 1' },
      genre: 'Аллегро',
      year: 1920,
      audios: [{ name: 'Аудіо 1', url: 'https://cdn/audio/a1.mp3' }],
      sheetMusic: [{ url: 'https://cdn/sheet/s1.pdf', name: 'Ноти 1', publishDate: '2020-01-01' }]
    }
  ]
};

const nullyFetchedOpus: FetchedOpusData = {
  id: 'opus-2',
  number: 1,
  compositions: [
    {
      id: 'comp-2',
      year: null,
      audios: [
        { name: null, url: 'https://cdn/audio/derived.mp3?token=abc' },
        { name: null, url: null }
      ],
      sheetMusic: [{ url: 'https://cdn/sheet/derived-notes.pdf', name: null, publishDate: null }]
    }
  ]
};

const fillValidDetails = (result: { current: ReturnType<typeof useUpsertOpus> }): void => {
  act(() => {
    result.current.setDetails((prev) => ({
      ...prev,
      number: '42',
      name: 'Соната',
      creationYear: '1922'
    }));
  });
};

describe('useUpsertOpus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpusByIdResult = { data: undefined, loading: false };
  });

  it('generates a unique composition id', () => {
    const id1 = createCompositionId();
    const id2 = createCompositionId();

    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });

  it('maps composition input correctly and handles missing urls or names', () => {
    const compositionData: OpusCompositionData = {
      id: 'comp-1',
      name: '  Твір  ',
      genre: '  Жанр  ',
      year: '  1990  ',
      audios: [
        { id: 'a1', name: ' Аудіо ', fileUrl: 'https://example.com/audio.mp3' },
        { id: 'a2', name: '', fileUrl: 'https://example.com/audio2.mp3?query=1' },
        { id: 'a3', name: '', fileUrl: '' }
      ],
      notes: [
        { id: 'n1', name: ' Ноти ', fileUrl: 'https://example.com/notes.pdf', publishDate: '2020-01-01' },
        { id: 'n2', name: '', fileUrl: 'https://example.com/notes2.pdf?test=true', publishDate: '' },
        { id: 'n3', name: '', fileUrl: '', publishDate: '' }
      ]
    };

    const input = toCompositionInput(compositionData);

    expect(input).toEqual({
      id: 'comp-1',
      name: 'Твір',
      genre: 'Жанр',
      year: '1990',
      audios: [
        { name: 'Аудіо', fileUrl: 'https://example.com/audio.mp3' },
        { name: 'audio2.mp3', fileUrl: 'https://example.com/audio2.mp3?query=1' }
      ],
      notes: [
        { name: 'Ноти', fileUrl: 'https://example.com/notes.pdf', publishDate: '2020-01-01' },
        { name: 'notes2.pdf', fileUrl: 'https://example.com/notes2.pdf?test=true', publishDate: '' }
      ]
    });
  });

  it('initialises with empty details and no errors', () => {
    const { result } = renderHook(() => useUpsertOpus());

    expect(result.current.details.name).toBe('');
    expect(result.current.detailsErrors).toEqual({ number: '', name: '', creationYear: '' });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isSaved).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('reports loading only while editing and query is loading', () => {
    mockOpusByIdResult = { data: undefined, loading: true };

    const { result } = renderHook(() => useUpsertOpus({ id: 'opus-1' }));

    expect(result.current.isEditing).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });

  it('does not submit and sets errors when required fields are missing', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(returnedId).toBeUndefined();
    expect(mockCreateOpus).not.toHaveBeenCalled();
    expect(result.current.detailsErrors.number).toBe(OPUS_VALIDATION_MESSAGES.numberRequired);
    expect(result.current.detailsErrors.name).toBe(OPUS_VALIDATION_MESSAGES.nameRequired);
    expect(result.current.detailsErrors.creationYear).toBe(OPUS_VALIDATION_MESSAGES.creationYearRequired);
    expect(result.current.forceShowErrors).toBe(true);
  });

  it('rejects a non-numeric number', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({ ...prev, number: 'abc', name: 'Соната', creationYear: '1922' }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.detailsErrors.number).toBe(OPUS_VALIDATION_MESSAGES.numberInvalid);
    expect(mockCreateOpus).not.toHaveBeenCalled();
  });

  it('rejects a non-positive number', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({ ...prev, number: '0', name: 'Соната', creationYear: '1922' }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.detailsErrors.number).toBe(OPUS_VALIDATION_MESSAGES.numberInvalid);
  });

  it('rejects a too-short name', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({ ...prev, number: '5', name: 'a', creationYear: '1922' }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.detailsErrors.name).toBe(OPUS_VALIDATION_MESSAGES.nameTooShort);
  });

  it('rejects empty and duplicate composition names before mutation', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '5',
        name: 'Соната',
        creationYear: '1922',
        compositions: [
          { id: 'empty', name: '  ', genre: '', year: '', audios: [], notes: [] },
          { id: 'first', name: ' Соната ', genre: '', year: '', audios: [], notes: [] },
          { id: 'second', name: 'Соната', genre: '', year: '', audios: [], notes: [] }
        ]
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateOpus).not.toHaveBeenCalled();
    expect(result.current.compositionErrors).toEqual({
      'compositions.empty.name': COMPOSITION_VALIDATION_MESSAGES.titleRequired,
    });
    expect(toast.error).toHaveBeenCalledWith(COMPOSITION_DUPLICATE_ERROR);
    expect(toast.error).toHaveBeenCalledWith(COMPOSITION_NAME_REQUIRED_ERROR);
  });

  it('rejects a composition with a one-character genre before mutation', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '5',
        name: 'Соната',
        creationYear: '1922',
        compositions: [{ id: 'composition', name: 'Соната', genre: 'a', year: '', audios: [], notes: [] }]
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateOpus).not.toHaveBeenCalled();
    expect(result.current.compositionErrors['compositions.composition.genre']).toBe(
      COMPOSITION_VALIDATION_MESSAGES.genreTooShort
    );
  });

  it('shows a toast and field error for a one-character composition name', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '5',
        name: 'Група',
        creationYear: '1922',
        compositions: [{ id: 'composition', name: 'A', genre: '', year: '', audios: [], notes: [] }]
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.compositionErrors['compositions.composition.name']).toBe(
      COMPOSITION_VALIDATION_MESSAGES.titleTooShort
    );
    expect(toast.error).toHaveBeenCalledWith(COMPOSITION_REQUIRED_FIELDS_ERROR);
    expect(mockCreateOpus).not.toHaveBeenCalled();
  });

  it('maps duplicate mutation errors to matching composition fields', async () => {
    mockCreateOpus.mockRejectedValue(new Error('Композиція " Соната " вже існує'));
    const { result } = renderHook(() => useUpsertOpus());
    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '5',
        name: 'Група',
        creationYear: '1922',
        compositions: [
          { id: 'first', name: ' Соната ', genre: '', year: '', audios: [], notes: [] },
          { id: 'second', name: 'Концерт', genre: '', year: '', audios: [], notes: [] }
        ]
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.compositionErrors).toEqual({ 'compositions.first.name': expect.any(String) });
    expect(result.current.isSaved).toBe(false);
  });

  it('marks invalid compositions when the mutation reports a required name error', async () => {
    mockCreateOpus.mockRejectedValue(new Error('Composition name is required'));
    const { result } = renderHook(() => useUpsertOpus());
    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '5',
        name: 'Р“СЂСѓРїР°',
        creationYear: '1922',
        compositions: [
          { id: 'valid', name: 'РўРІС–СЂ', genre: '', year: '', audios: [], notes: [] }
        ]
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.compositionErrors).toEqual({});
    expect(toast.error).toHaveBeenCalledWith(COMPOSITION_NAME_REQUIRED_ERROR);
    expect(result.current.isSaved).toBe(false);
  });

  it('reports non-composition mutation errors without throwing', async () => {
    mockCreateOpus.mockRejectedValue(new Error('Network failed'));
    const { result } = renderHook(() => useUpsertOpus());
    fillValidDetails(result);

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(toast.error).toHaveBeenCalledWith('Network failed');
    expect(result.current.isSaved).toBe(false);
  });

  it('creates an opus with mapped input when valid', async () => {
    mockCreateOpus.mockResolvedValue({ data: { createOpus: { id: 'opus-99' } } });

    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '42',
        name: 'Соната',
        creationYear: '1922',
        genre: 'Соната',
        compositions: [
          { id: 'c1', name: 'Перший твір', genre: 'Соната', year: '1920', audios: [], notes: [] }
        ]
      }));
    });

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(returnedId).toBe('opus-99');
    expect(mockCreateOpus).toHaveBeenCalledTimes(1);

    const payload = mockCreateOpus.mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        numberKind: 'op',
        number: 42,
        name: { uk: 'Соната', en: 'Соната' },
        adminTitle: 'Соната'
      })
    );
    expect(payload.publishedAt).toBeUndefined();
    expect(payload.coverImage.crop).toBeUndefined();
    expect(payload.compositions[0]).toEqual(
      expect.objectContaining({ name: 'Перший твір', genre: 'Соната', year: '1920' })
    );
    expect(result.current.isSaved).toBe(true);
  });

  it('omits optional fields and filters out unnamed media when creating', async () => {
    mockCreateOpus.mockResolvedValue({ data: { createOpus: { id: 'opus-100' } } });

    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({
        ...prev,
        number: '7',
        name: 'Соната',
        creationYear: '1900',
        additionalText: '',
        endYear: '',
        datesNote: '',
        genre: '',
        compositions: [
          {
            id: 'c1',
            name: 'Твір',
            genre: '',
            year: '',
            audios: [
              { id: 'a1', name: '    ', fileUrl: '', publishDate: '' },
              { id: 'a2', name: 'Аудіо', fileUrl: 'audio-url' }
            ],
            notes: [
              { id: 'n1', name: '', fileUrl: '', publishDate: '' },
              { id: 'n2', name: 'Ноти', fileUrl: 'notes-url', publishDate: '' }
            ]
          }
        ]
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    const payload = mockCreateOpus.mock.calls[0][0];
    expect(payload.additionalText).toBeUndefined();
    expect(payload.endYear).toBeUndefined();
    expect(payload.datesNote).toBeUndefined();
    expect(payload.genre).toEqual({ en: undefined, uk: undefined });

    const composition = payload.compositions[0];
    expect(composition.genre).toBeUndefined();
    expect(composition.year).toBeUndefined();
    expect(composition.audios).toEqual([{ name: 'Аудіо', fileUrl: 'audio-url' }]);
    expect(composition.notes).toEqual([{ name: 'Ноти', fileUrl: 'notes-url', publishDate: '' }]);
  });

  it('sets publishedAt and maps cover-image fallbacks when publishing', async () => {
    mockCreateOpus.mockResolvedValue({ data: { createOpus: { id: 'opus-101' } } });

    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setDetails((prev) => ({ ...prev, number: '5', name: 'Соната', creationYear: '1900' }));
      result.current.setCrop({ x: 10, y: 20, width: 30, height: 40 });
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Published);
    });

    const payload = mockCreateOpus.mock.calls[0][0];
    expect(typeof payload.publishedAt).toBe('string');
    expect(payload.title).toEqual({ uk: '', en: '' });
    expect(payload.coverImage.src).toBe('Соната');
    expect(payload.coverImage.alt).toEqual({ uk: 'Соната', en: 'Соната' });
    expect(payload.coverImage.crop).toEqual({ x: 10, y: 20, width: 30, height: 40 });
  });

  test.each([
    ['title', 'a'],
    ['title', 'a'.repeat(META_TITLE_LENGTH.max + 1)],
    ['description', 'a'],
    ['description', 'a'.repeat(META_DESCRIPTION_LENGTH.max + 1)],
    ['keywords', 'a'],
    ['keywords', 'a'.repeat(META_KEYWORDS_LENGTH.max + 1)],
    ['keywords', 'one, ,two']
  ] as const)('rejects invalid optional SEO %s values before mutation', async (field, fieldValue) => {
    const { result } = renderHook(() => useUpsertOpus());
    fillValidDetails(result);

    act(() => {
      result.current.setSeoValue((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          uk: { ...prev.meta.uk, [field]: fieldValue }
        }
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateOpus).not.toHaveBeenCalled();
    expect(result.current.forceShowErrors).toBe(true);
  });

  it('validates SEO metadata independently for the English locale', async () => {
    const { result } = renderHook(() => useUpsertOpus());
    fillValidDetails(result);

    act(() => {
      result.current.setSeoValue((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          en: { ...prev.meta.en, description: 'a' }
        }
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateOpus).not.toHaveBeenCalled();
    expect(result.current.forceShowErrors).toBe(true);
  });

  it('requires alt text in both locales only when a preview image is selected', async () => {
    const { result } = renderHook(() => useUpsertOpus());
    fillValidDetails(result);

    act(() => {
      result.current.setSeoValue((prev) => ({
        ...prev,
        ogImage: 'https://example.com/image.png'
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateOpus).not.toHaveBeenCalled();
    expect(result.current.forceShowErrors).toBe(true);
  });

  it('accepts valid SEO values at the configured maximum lengths', async () => {
    mockCreateOpus.mockResolvedValue({ data: { createOpus: { id: 'opus-seo-valid' } } });
    const { result } = renderHook(() => useUpsertOpus());
    fillValidDetails(result);

    act(() => {
      result.current.setSeoValue((prev) => ({
        ...prev,
        ogImage: 'https://example.com/image.png',
        meta: {
          uk: {
            ...prev.meta.uk,
            title: 'a'.repeat(META_TITLE_LENGTH.max),
            description: 'a'.repeat(META_DESCRIPTION_LENGTH.max),
            keywords: 'a'.repeat(META_KEYWORDS_LENGTH.max),
            altText: { uk: 'a'.repeat(META_ALT_TEXT_LENGTH.max), en: prev.meta.uk.altText?.en ?? '' }
          },
          en: {
            ...prev.meta.en,
            title: 'a'.repeat(META_TITLE_LENGTH.max),
            description: 'a'.repeat(META_DESCRIPTION_LENGTH.max),
            keywords: 'a'.repeat(META_KEYWORDS_LENGTH.max),
            altText: { uk: prev.meta.en.altText?.uk ?? '', en: 'a'.repeat(META_ALT_TEXT_LENGTH.max) }
          }
        }
      }));
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateOpus).toHaveBeenCalledTimes(1);
  });

  it('keeps isSaved false when create returns no id', async () => {
    mockCreateOpus.mockResolvedValue({ data: { createOpus: null } });

    const { result } = renderHook(() => useUpsertOpus());

    fillValidDetails(result);

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(returnedId).toBeUndefined();
    expect(result.current.isSaved).toBe(false);
  });

  it('initialises fields from fetched data when editing', () => {
    mockOpusByIdResult = { data: { opusById: fullFetchedOpus }, loading: false };

    const { result } = renderHook(() => useUpsertOpus({ id: 'opus-1' }));

    expect(result.current.isEditing).toBe(true);
    expect(result.current.details.numberKind).toBe('sineop');
    expect(result.current.details.number).toBe('42');
    expect(result.current.details.name).toBe('Симфонія');
    expect(result.current.details.additionalText).toBe('Примітка');
    expect(result.current.details.creationYear).toBe('1921');
    expect(result.current.details.endYear).toBe('1923');
    expect(result.current.details.genre).toBe('Симфонія');

    const composition = result.current.details.compositions[0];
    expect(composition.name).toBe('Твір 1');
    expect(composition.genre).toBe('Аллегро');
    expect(composition.year).toBe('1920');
    expect(composition.audios[0]).toEqual(
      expect.objectContaining({ name: 'Аудіо 1', fileUrl: 'https://cdn/audio/a1.mp3' })
    );
    expect(composition.notes[0]).toEqual(
      expect.objectContaining({ name: 'Ноти 1', fileUrl: 'https://cdn/sheet/s1.pdf', publishDate: '2020-01-01' })
    );

    expect(result.current.seoValue.meta.uk.title).toBe('UK title');
    expect(result.current.seoValue.ogImage).toBe('https://cdn/image.png');
    expect(result.current.seoValue.allowIndexing.uk).toBe(false);
    expect(result.current.crop).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    expect(result.current.isSaved).toBe(true);
  });

  it('falls back to defaults for missing fetched fields', () => {
    mockOpusByIdResult = { data: { opusById: nullyFetchedOpus }, loading: false };

    const { result } = renderHook(() => useUpsertOpus({ id: 'opus-2' }));

    expect(result.current.details.numberKind).toBe('op');
    expect(result.current.details.name).toBe('');
    expect(result.current.details.creationYear).toBe('');

    const composition = result.current.details.compositions[0];
    expect(composition.year).toBe('');
    expect(composition.audios[0].name).toBe('derived.mp3');
    expect(composition.audios[1].name).toBe('');
    expect(composition.notes[0].name).toBe('derived-notes.pdf');

    expect(result.current.seoValue.ogImage).toBeNull();
    expect(result.current.seoValue.allowIndexing.uk).toBe(true);
    expect(result.current.crop).toBeNull();
  });

  it('does not initialise when editing but fetched data is absent', () => {
    mockOpusByIdResult = { data: undefined, loading: false };

    const { result } = renderHook(() => useUpsertOpus({ id: 'opus-3' }));

    expect(result.current.isEditing).toBe(true);
    expect(result.current.details.name).toBe('');
  });

  it('ignores later fetched data once initialised', () => {
    mockOpusByIdResult = { data: { opusById: fullFetchedOpus }, loading: false };

    const { result, rerender } = renderHook(() => useUpsertOpus({ id: 'opus-1' }));

    expect(result.current.details.name).toBe('Симфонія');

    mockOpusByIdResult = { data: { opusById: nullyFetchedOpus }, loading: false };
    rerender();

    expect(result.current.details.name).toBe('Симфонія');
  });

  it('updates an existing opus using fetched values', async () => {
    mockOpusByIdResult = { data: { opusById: fullFetchedOpus }, loading: false };
    mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'opus-1' } } });

    const { result } = renderHook(() => useUpsertOpus({ id: 'opus-1' }));

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(returnedId).toBe('opus-1');
    expect(mockUpdateOpus).toHaveBeenCalledTimes(1);

    const args = mockUpdateOpus.mock.calls[0][0];
    expect(args.id).toBe('opus-1');
    expect(args.input).toEqual(
      expect.objectContaining({
        name: { uk: 'Симфонія', en: 'Симфонія' },
        number: 42
      })
    );
    expect(result.current.isSaved).toBe(true);
  });

  it('returns undefined when update returns no id', async () => {
    mockOpusByIdResult = { data: { opusById: fullFetchedOpus }, loading: false };
    mockUpdateOpus.mockResolvedValue({ data: { updateOpus: null } });

    const { result } = renderHook(() => useUpsertOpus({ id: 'opus-1' }));

    let returnedId: string | undefined;
    await act(async () => {
      returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(returnedId).toBeUndefined();
    expect(mockUpdateOpus).toHaveBeenCalledTimes(1);
  });

  it('clears field errors as fields are filled and supports both setter forms', async () => {
    const { result } = renderHook(() => useUpsertOpus());

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(result.current.detailsErrors.number).toBeTruthy();

    act(() => {
      result.current.setDetails({
        ...result.current.details,
        number: '5',
        name: 'Valid name',
        creationYear: '1900'
      });
    });

    expect(result.current.detailsErrors).toEqual({ number: '', name: '', creationYear: '' });

    act(() => {
      result.current.setDetails((prev) => ({ ...prev, number: '', name: '', creationYear: '' }));
    });

    expect(result.current.details.number).toBe('');
    expect(result.current.isSaved).toBe(false);
  });

  it('supports value and updater forms for SEO and crop setters', () => {
    const { result } = renderHook(() => useUpsertOpus());

    act(() => {
      result.current.setSeoValue({
        meta: {
          uk: { title: 'set', description: '', keywords: '', altText: { uk: '', en: '' } },
          en: { title: '', description: '', keywords: '', altText: { uk: '', en: '' } }
        },
        ogImage: 'og',
        allowIndexing: { uk: true, en: true }
      });
    });

    expect(result.current.seoValue.meta.uk.title).toBe('set');

    act(() => {
      result.current.setSeoValue((prev) => ({ ...prev, ogImage: 'updated' }));
      result.current.setCrop({ x: 0, y: 0, width: 5, height: 5 });
    });

    expect(result.current.seoValue.ogImage).toBe('updated');
    expect(result.current.crop).toEqual({ x: 0, y: 0, width: 5, height: 5 });

    act(() => {
      result.current.setCrop(null);
    });

    expect(result.current.crop).toBeNull();
  });
});
