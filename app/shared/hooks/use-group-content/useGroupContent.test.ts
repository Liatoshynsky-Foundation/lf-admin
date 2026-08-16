import { act, renderHook, waitFor } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';
import toast from 'react-hot-toast';

import { useGroupContent } from './useGroupContent';
import {
  COMPOSITION_DUPLICATE_ERROR,
  COMPOSITION_NAME_REQUIRED_ERROR,
  COMPOSITION_REQUIRED_FIELDS_ERROR,
  OPUS_MUTATION_RESULTS,
  OPUS_VALIDATION_MESSAGES,
  REQUIRED_FIELD_ERROR
} from '~/constants/opus';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useDeleteOpus, useOpusById, useUpdateOpus } from '~/shared/hooks/use-opuses/useOpuses';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';
import type { DeleteOpusMutationVariables, UpdateOpusMutationVariables } from '~/types/graphql/generated/graphql';
import { OpusCompositionData } from '~/types/opus';

const mockNavigate = jest.fn();
const mockUpdateOpus = jest.fn();
const mockDeleteOpus = jest.fn();
const updateOpusForTest = (variables: UpdateOpusMutationVariables) => mockUpdateOpus({ variables });
const deleteOpusForTest = (variables: DeleteOpusMutationVariables) => mockDeleteOpus({ variables });

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockReturnValue(null)
  }))
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/shared/hooks/use-navigation-guard/useNavigationGuard', () => ({
  useNavigationGuard: jest.fn()
}));

jest.mock('~/shared/hooks/use-unsaved-changes/useUnsavedChanges', () => ({
  useUnsavedChanges: jest.fn()
}));

jest.mock('~/shared/hooks/use-opuses/useOpuses', () => ({
  useOpusById: jest.fn(),
  useUpdateOpus: jest.fn(),
  useDeleteOpus: jest.fn()
}));


const mockFetchedOpus = {
  id: 'test-id',
  numberKind: 'op',
  number: '42',
  name: { uk: 'Test Opus UK', en: 'Test Opus EN' },
  additionalText: 'bis',
  genre: { uk: 'Symphony', en: 'Symphony EN' },
  creationYear: 1980,
  endYear: null,
  datesNote: null,
  status: 'draft',
  parts: { uk: 'Part 1', en: 'Part 1 EN' },
  introDescription: { uk: '{"type":"doc"}', en: '{"type":"doc"}' },
  gallery: [
    {
      id: 'photo-1',
      src: 'https://example.com/photo.jpg',
      description: { uk: 'Desc', en: 'Desc EN' },
      altText: { uk: 'Alt', en: 'Alt EN' },
      crop: { x: 0, y: 0, width: 100, height: 100 }
    }
  ],
  performancesTitle: { uk: 'Performances', en: 'Performances EN' },
  performances: [
    {
      id: 'perf-1',
      title: { uk: 'Perf 1', en: 'Perf 1 EN' },
      videoUrl: 'https://youtube.com/watch'
    }
  ],
  compositions: [
    {
      id: 'comp-1',
      name: { uk: 'Comp 1', en: 'Comp 1 EN' },
      title: { uk: 'Comp 1', en: 'Comp 1 EN' },
      genre: 'Sonata',
      year: 1920,
      order: 1,
      audios: [{ name: 'Audio 1', url: 'https://example.com/audio.mp3' }],
      sheetMusic: []
    }
  ]
};

describe('useGroupContent Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigationGuard as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    (useOpusById as jest.Mock).mockReturnValue({ data: undefined, loading: false, error: undefined });
    (useUpdateOpus as jest.Mock).mockReturnValue([updateOpusForTest, { loading: false }]);
    (useDeleteOpus as jest.Mock).mockReturnValue([deleteOpusForTest, { loading: false }]);
  });

  describe('Initialization & Data Parsing', () => {
    it('should correctly parse valid JSON, objects in description, and extract filenames from URL', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            introDescription: {
              uk: '{"type":"doc","content":[{"type":"text","text":"Valid JSON"}]}',
              en: { type: 'doc', content: [] }
            },
            compositions: [
              {
                id: 'comp-1',
                title: { uk: 'Comp 1' },
                audios: [{ name: null, url: 'https://cdn.com/track.mp3?token=123' }],
                sheetMusic: [{ name: null, url: null }]
              }
            ]
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData?.description.uk).toEqual({
          type: 'doc',
          content: [{ type: 'text', text: 'Valid JSON' }]
        });
        expect(result.current.groupData?.description.en).toEqual({ type: 'doc', content: [] });

        expect(result.current.groupData?.compositions[0].audios[0].name).toBe('track.mp3');
        expect(result.current.groupData?.compositions[0].notes[0].name).toBe('');
      });
    });
    it('should initialize with loading state when data is being fetched', () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: undefined, loading: true, error: undefined });

      const { result } = renderHook(() => useGroupContent('test-id'));

      expect(result.current.loading).toBe(true);
      expect(result.current.groupData).toBeNull();
      expect(result.current.isDirty).toBe(false);
    });

    it('should populate groupData and publishedTitle when fetched data is available', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: mockFetchedOpus },
        loading: false,
        error: undefined
      });

      const { result } = renderHook(() => useGroupContent('test-id'));
      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
        expect(result.current.groupData?.groupNumber).toBe('42');
        expect(result.current.groupData?.titlePrefix).toBe('op');
        expect(result.current.groupData?.genre).toEqual({ uk: 'Symphony', en: 'Symphony EN' });
        expect(result.current.publishedTitle.uk).toBe('Test Opus UK');
      });
    });

    it('should correctly parse invalid JSON description, map "sineop" prefix, and strip "op." from number', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            numberKind: 'sineop',
            number: 15,
            introDescription: { uk: 'Plain text description', en: null },
            gallery: null,
            compositions: null
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData?.titlePrefix).toBe('sineop');
        expect(result.current.groupData?.groupNumber).toBe('15');
        expect(result.current.groupData?.description.uk).toEqual({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Plain text description' }] }]
        });
        expect(result.current.groupData?.description.en).toEqual({ type: 'doc', content: [] });
        expect(result.current.groupData?.photos).toEqual([]);
        expect(result.current.groupData?.compositions).toEqual([]);
      });
    });

    it('should handle errors during data fetching', () => {
      const mockError = new Error('Failed to fetch');
      (useOpusById as jest.Mock).mockReturnValue({ data: undefined, loading: false, error: mockError });

      const { result } = renderHook(() => useGroupContent('test-id'));

      expect(result.current.error).toBe(mockError);
    });

    it('should return empty doc when description is null', () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: { ...mockFetchedOpus, introDescription: null } },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));

      waitFor(() => {
        expect(result.current.groupData?.description.uk).toEqual({ type: 'doc', content: [] });
      });
    });

    it('should return default empty doc for unsupported description types', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            introDescription: { uk: 123, en: true }
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData?.description.uk).toEqual({ type: 'doc', content: [] });
        expect(result.current.groupData?.description.en).toEqual({ type: 'doc', content: [] });
      });
    });

    it('should show validation error and expand details when handleMenuOptionClick fails validation', async () => {
      const invalidOpus = {
        ...mockFetchedOpus,
        name: { uk: '', en: '' }
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: invalidOpus },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
      });
      act(() => {
        result.current.setIsDetailsExpanded(false);
      });
      await act(async () => {
        await result.current.handleMenuOptionClick('PUBLISH');
      });
      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_REQUIRED_FIELDS_ERROR);
      expect(result.current.isDetailsExpanded).toBe(true);
      expect(mockUpdateOpus).not.toHaveBeenCalled();
    });

    it('should handle compositions with null or undefined order in sort', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            compositions: [
              { id: 'comp-1', order: null },
              { id: 'comp-2', order: 2 }
            ]
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData?.compositions).toBeDefined();
        expect(result.current.groupData?.compositions[0].id).toBe('comp-1');
      });
    });

    it('should handle compositions sort with null orders and map null audio names to file name from url', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            compositions: [
              { id: 'comp-1', order: null, audios: [{ name: null, url: 'https://files/audio.mp3' }] },
              { id: 'comp-2', order: undefined, audios: [] }
            ]
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData?.compositions).toBeDefined();
        expect(result.current.groupData?.compositions[0].audios[0].name).toBe('audio.mp3');
      });
    });

    it('should apply default fallback values when fetched optional fields are null or undefined', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            status: null,
            genre: null,
            additionalText: undefined,
            name: { uk: null, en: undefined },
            parts: null
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
        expect(result.current.groupData?.status).toBe('draft');
        expect(result.current.groupData?.genre.uk).toBe('');
        expect(result.current.groupData?.genre.en).toBe('');
        expect(result.current.groupData?.additionalText).toBe('');
        expect(result.current.groupData?.groupTitle.uk).toBe('');
        expect(result.current.groupData?.groupTitle.en).toBe('');
        expect(result.current.groupData?.parts.uk).toBe('');
        expect(result.current.groupData?.parts.en).toBe('');
      });
    });
  });

  describe('UI State & Menu Interactions', () => {
    it('should ignore field changes if shouldExitAfterSave is true', async () => {
      jest.useFakeTimers();
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });
      const { result } = renderHook(() => useGroupContent('test-id'));
      await act(async () => {
        await result.current.handleMenuOptionClick('PUBLISH_AND_EXIT');
      });

      act(() => {
        jest.advanceTimersByTime(50);
      });

      act(() => {
        result.current.handleFieldChange('genre', 'Blocked Genre');
      });

      expect(result.current.groupData?.genre).not.toBe('Blocked Genre');

      jest.useRealTimers();
    });

    it('should handle field changes safely when groupData is null', () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: undefined, loading: true });

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleFieldChange('genre', 'Safe Genre');
      });

      expect(result.current.groupData).toBeNull();
    });
    it('should handle opening and closing menus (anchors)', () => {
      const { result } = renderHook(() => useGroupContent('test-id'));
      const mockEvent = { currentTarget: document.createElement('button') } as unknown as React.MouseEvent<HTMLElement>;

      act(() => {
        result.current.handleOpen(mockEvent, 'publish');
      });
      expect(result.current.anchors['publish']).toBe(mockEvent.currentTarget);

      act(() => {
        result.current.handleClose('publish');
      });
      expect(result.current.anchors['publish']).toBeNull();
    });

    it('should change current language correctly', () => {
      const { result } = renderHook(() => useGroupContent('test-id'));
      expect(result.current.currentLanguage).toBe('UA');
      expect(result.current.langKey).toBe('uk');

      act(() => {
        result.current.setCurrentLanguage('EN');
      });
      expect(result.current.currentLanguage).toBe('EN');
      expect(result.current.langKey).toBe('en');
    });
  });

  describe('Field Interactions', () => {
    it('should update field value and set isDirty flag to true', () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleFieldChange('genre', 'New Genre');
      });

      expect(result.current.groupData?.genre).toBe('New Genre');
      expect(result.current.isDirty).toBe(true);
      expect(useUnsavedChanges).toHaveBeenCalledWith(true);
    });

    it('should update multilingual field correctly', () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleFieldChange('groupTitle', 'Updated Title UK', true);
      });

      expect(result.current.groupData?.groupTitle.uk).toBe('Updated Title UK');
    });

    it('should clear specific validation error when the field is updated', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: { ...mockFetchedOpus, number: '' } },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });
      expect(result.current.errors.groupNumber).toBeDefined();

      act(() => {
        result.current.handleFieldChange('groupNumber', '10');
      });
      expect(result.current.errors.groupNumber).toBeUndefined();
    });
  });

  describe('Validation & Saving', () => {
    it('should catch server errors during save and display error toast', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });

      mockUpdateOpus.mockRejectedValue(new Error('GraphQL Server Error'));

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(toast.error).toHaveBeenCalledWith('GraphQL Server Error');
    });

    it('should map duplicate composition errors returned by the server', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockRejectedValue(new Error('Композиція "Comp 1" вже існує'));

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors['compositions.comp-1.name']).toContain('Comp 1');
      expect(toast.error).toHaveBeenCalledWith('Композиція "Comp 1" вже існує');
    });

    it('should map required composition-name errors returned by the server', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });

      const { result } = renderHook(() => useGroupContent('test-id'));
      mockUpdateOpus.mockImplementation(async () => {
        const composition = result.current.groupData?.compositions[0];
        if (composition) {
          composition.name = ' ';
        }
        throw new Error('Composition name is required');
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_NAME_REQUIRED_ERROR);
      expect(result.current.errors['compositions.comp-1.name']).toBe('');
      expect(result.current.isDirty).toBe(false);
    });
    it('should strip temporary IDs (starting with photo- or containing -) on save', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({});

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleFieldChange('photos', [
          {
            id: 'photo-12345',
            src: 'img1.jpg',
            caption: { uk: '', en: '' },
            altText: { uk: 'Alt Text', en: 'Alt Text' },
            crop: null
          },
          {
            id: '60d5ec49f1',
            src: 'img2.jpg',
            caption: { uk: '', en: '' },
            altText: { uk: 'Alt Text', en: 'Alt Text' },
            crop: null
          }
        ]);
        result.current.handleFieldChange('performances', [
          { id: 'temp-perf-123', url: 'url1', caption: { uk: 'Valid', en: 'Valid' } }
        ]);
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      const calledInput = mockUpdateOpus.mock.calls[0][0].variables.input;

      expect(calledInput.gallery[0].id).toBeUndefined();
      expect(calledInput.gallery[1].id).toBe('60d5ec49f1');
      expect(calledInput.performances[0].id).toBeUndefined();
    });
    it('should map null crops to null and filter out completely empty performances on save', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            gallery: [
              { id: 'photo-1', src: 'img.jpg', crop: null, altText: { uk: 'Alt', en: 'Alt' }, description: null }
            ],
            performances: [{ id: 'perf-1', title: null, videoUrl: null }]
          }
        },
        loading: false
      });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      const calledInput = mockUpdateOpus.mock.calls[0][0].variables.input;

      expect(calledInput.performances).toHaveLength(0);
      expect(calledInput.gallery[0].crop).toBeNull();
    });
    it('should clear temporary IDs for photos/performances on save', async () => {
      const customOpus = {
        ...mockFetchedOpus,
        gallery: [
          { id: 'photo-123', src: 'img.jpg', crop: null, altText: { uk: 'Alt Text', en: 'Alt Text' } },
          { id: '60d5ec49f1', src: 'img2.jpg', crop: null, altText: { uk: 'Alt Text', en: 'Alt Text' } }
        ],
        performances: [
          { id: 'perf-456', videoUrl: 'url1', title: { uk: 'Valid', en: 'Valid' } },
          { id: '60d5ec49f2', videoUrl: 'url2', title: { uk: 'Valid', en: 'Valid' } }
        ]
      };
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: customOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({});

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      const calledInput = mockUpdateOpus.mock.calls[0][0].variables.input;

      expect(calledInput.gallery[0].id).toBeUndefined();
      expect(calledInput.gallery[1].id).toBe('60d5ec49f1');
      expect(calledInput.performances[0].id).toBeUndefined();
      expect(calledInput.performances[1].id).toBe('60d5ec49f2');
    });

    it('should navigate to edit page on handleBackClick if "from" param is "create"', () => {
      const mockSearchParams = { get: jest.fn().mockReturnValue('create') };
      jest.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(mockSearchParams as any);

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleBackClick();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/creativity/group/test-id/edit');
    });

    it('should return early from handlePublishClick if isSaving is true', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      (useUpdateOpus as jest.Mock).mockReturnValue([updateOpusForTest, { loading: true }]);

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(mockUpdateOpus).not.toHaveBeenCalled();
    });
    it('should show validation error for non-numeric or negative group numbers', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: { ...mockFetchedOpus, number: '-5' }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(mockUpdateOpus).not.toHaveBeenCalled();
      expect(result.current.errors.groupNumber).toBe(OPUS_VALIDATION_MESSAGES.numberInvalid);
      expect(result.current.isDetailsExpanded).toBe(true);
    });

    it('should block save if required title, prefix or year are missing', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: { ...mockFetchedOpus, name: { uk: '', en: '' }, creationYear: null }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors['groupTitle.uk']).toBe(OPUS_VALIDATION_MESSAGES.nameRequired);
      expect(result.current.errors.creationYear).toBe(REQUIRED_FIELD_ERROR);
      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_REQUIRED_FIELDS_ERROR);
    });

    it('should successfully save data and show success toast on handlePublishClick', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(mockUpdateOpus).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Групу опубліковано');
      expect(result.current.isDirty).toBe(false);
    });

    it('should handle menu option PUBLISH correctly', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handleMenuOptionClick('PUBLISH');
      });

      expect(mockUpdateOpus).toHaveBeenCalled();
      expect(result.current.isDirty).toBe(false);
    });

    it('should handle menu option PUBLISH_AND_EXIT correctly', async () => {
      jest.useFakeTimers();
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handleMenuOptionClick('PUBLISH_AND_EXIT');
      });

      expect(mockUpdateOpus).toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/creativity');
      jest.useRealTimers();
    });

    it('should open delete modal and bypass validation for DELETE option', async () => {
      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleMenuOptionClick('DELETE');
      });

      expect(result.current.isDeleteModalOpen).toBe(true);
      expect(mockUpdateOpus).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should trigger validation error for empty titlePrefix', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleFieldChange('titlePrefix' as any, '');
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors.titlePrefix).toBe(REQUIRED_FIELD_ERROR);
    });

    it('should expand details and return early when validation fails on publish', async () => {
      const invalidOpus = {
        ...mockFetchedOpus,
        number: '',
        name: { uk: '', en: '' }
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: invalidOpus },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));
      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
      });
      act(() => {
        result.current.setIsDetailsExpanded(false);
      });
      expect(result.current.isDetailsExpanded).toBe(false);
      await act(async () => {
        await result.current.handlePublishClick();
      });
      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_REQUIRED_FIELDS_ERROR);
      expect(result.current.isDetailsExpanded).toBe(true);
    });

    it('should filter out compositions notes with empty names during save', async () => {
      const dataWithEmptyNote = {
        ...mockFetchedOpus,
        compositions: [
          {
            id: 'c1',
            name: { uk: 'Test Title', en: 'Test Title' },
            title: { uk: 'Test Title' },
            sheetMusic: [
              { name: '', url: null },
              { name: 'Valid', url: 'test2.pdf' }
            ]
          }
        ]
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: dataWithEmptyNote },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));
      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      const lastCall = mockUpdateOpus.mock.calls[mockUpdateOpus.mock.calls.length - 1][0];
      const input = lastCall.variables.input;
      const notes = input.compositions[0].notes;
      expect(notes).toHaveLength(1);
      expect(notes[0].name).toBe('Valid');
    });

    it('should cover all edge-case fallbacks (null arrays, sparse crops, Bo. prefix, empty strings)', async () => {
      const sparseData = {
        ...mockFetchedOpus,
        performancesTitle: { uk: null, en: 'EN Only' },
        performances: null,
        gallery: [
          {
            id: 'photo-1',
            src: null,
            description: null,
            altText: null,
            crop: { x: null, y: null, width: null, height: null }
          }
        ]
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: sparseData },
        loading: false
      });

      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
      });

      act(() => {
        result.current.handleFieldChange('titlePrefix' as any, 'sineop');

        result.current.handleFieldChange('compositions', [
          {
            id: 'c1',
            name: 'Test',
            genre: '',
            year: '',
            audios: null,
            notes: null
          } as unknown as OpusCompositionData
        ]);
        result.current.handleFieldChange('photos', null);
        result.current.handleFieldChange('genre', null);
        result.current.handleFieldChange('additionalText', null);
      });
      await act(async () => {
        await result.current.handlePublishClick();
      });
      const calledInput = mockUpdateOpus.mock.calls[0][0].variables.input;
      expect(calledInput.numberKind).toBe('sineop');
      expect(calledInput.genre).toEqual({ en: '', uk: '' });
      expect(calledInput.additionalText).toBe('');
      expect(calledInput.gallery).toEqual([]);
      expect(calledInput.compositions[0].audios).toEqual([]);
    });

    it('should cover completely missing performancesTitle (fallback to empty string)', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: { ...mockFetchedOpus, performancesTitle: null } },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));
      await waitFor(() => {
        expect(result.current.groupData?.performancesTitle).toBe('');
      });
    });

    it('should successfully delete opus, show toast, close modal and navigate on handleConfirmDelete', async () => {
      mockDeleteOpus.mockResolvedValue({});
      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.setIsDeleteModalOpen(true);
      });

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      expect(mockDeleteOpus).toHaveBeenCalledWith({ variables: { id: 'test-id' } });
      expect(toast.success).toHaveBeenCalledWith(OPUS_MUTATION_RESULTS.deleted);
      expect(result.current.isDeleteModalOpen).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/creativity');
    });

    it('should handle errors during handleConfirmDelete, show error toast and keep modal open', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDeleteOpus.mockRejectedValue(new Error('GraphQL Error'));
      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.setIsDeleteModalOpen(true);
      });

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      expect(mockDeleteOpus).toHaveBeenCalledWith({ variables: { id: 'test-id' } });
      expect(toast.error).toHaveBeenCalledWith('GraphQL Error');
      expect(result.current.isDeleteModalOpen).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should abort handleSave and not call updateOpus if validation fails', async () => {
      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(mockUpdateOpus).not.toHaveBeenCalled();

      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_REQUIRED_FIELDS_ERROR);
    });

    it('should return early from handleSave if groupData is null', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: undefined, loading: true });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(mockUpdateOpus).not.toHaveBeenCalled();
    });

    it('should use fallbacks for optional fields during save', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            endYear: 2025,
            datesNote: 'Important note'
          }
        },
        loading: false
      });

      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData).not.toBeNull());

      act(() => {
        result.current.handleFieldChange('parts', { uk: '', en: '' });
        result.current.handleFieldChange('description', { uk: null, en: null });
        result.current.handleFieldChange('compositions', null);
        result.current.handleFieldChange('performances', null);
        result.current.handleFieldChange('performancesTitle', '');
        result.current.handleFieldChange('groupTitle', { uk: 'Valid UK Title', en: 'Valid EN Title' });
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      const calledInput = mockUpdateOpus.mock.calls[0][0].variables.input;

      expect(calledInput.endYear).toBe('2025');
      expect(calledInput.datesNote).toBe('Important note');
      expect(calledInput.compositions).toEqual([]);
      expect(calledInput.performances).toEqual([]);
      expect(calledInput.introDescription.uk).toBe('""');
    });

    it('should handle missing numberKind and empty photo src', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            numberKind: null,
            gallery: [{ id: 'photo-1', src: '', crop: null }]
          }
        },
        loading: false
      });

      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData).not.toBeNull());

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.groupData?.titlePrefix).toBe('op');
      const calledInput = mockUpdateOpus.mock.calls[0][0].variables.input;
      expect(calledInput.gallery[0].src).toBe('');
    });

    it('should fallback to empty object when updating a multilingual field but previous value is primitive', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: mockFetchedOpus },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData).not.toBeNull());

      act(() => {
        result.current.handleFieldChange('genre', 'Pop', true);
      });

      expect((result.current.groupData?.genre as any).uk).toBe('Pop');
    });

    it('should trigger validation error when groupTitle is too short', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: mockFetchedOpus },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
      });

      act(() => {
        result.current.handleFieldChange('groupTitle', 'a', true);
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors['groupTitle.uk']).toBe(OPUS_VALIDATION_MESSAGES.nameTooShort);

      expect(mockUpdateOpus).not.toHaveBeenCalled();
    });

    it('should trim whitespace from genre, additionalText, and datesNote on save', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: mockFetchedOpus },
        loading: false
      });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData).not.toBeNull();
      });

      act(() => {
        result.current.handleFieldChange('genre', '   Pop   ', true);
        result.current.handleFieldChange('additionalText', '   Some text   ');
        result.current.handleFieldChange('dateAdditionalText', '  Note  ');
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      const calledInput = mockUpdateOpus.mock.calls[0][0].variables.input;

      expect(calledInput.genre.uk).toBe('Pop');
      expect(calledInput.additionalText).toBe('Some text');
      expect(calledInput.datesNote).toBe('Note');
    });

    it('should trigger validation errors when performance caption is too long or EN is invalid', async () => {
      const longText = 'a'.repeat(251);

      const customOpus = {
        ...mockFetchedOpus,
        performances: [
          { id: 'perf-1', videoUrl: 'url1', title: { uk: longText, en: 'Valid EN' } },
          { id: 'perf-2', videoUrl: 'url2', title: { uk: 'Valid UK', en: '' } },
          { id: 'perf-3', videoUrl: 'url3', title: { uk: 'Valid UK', en: 'a' } },
          { id: 'perf-4', videoUrl: 'url4', title: { uk: 'Valid UK', en: longText } },
          { id: 'perf-5', videoUrl: 'url5', title: { uk: '', en: 'Valid EN' } },
          { id: 'perf-6', videoUrl: 'url6', title: { uk: 'a', en: 'Valid EN' } }
        ]
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: customOpus },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData).not.toBeNull());
      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors['performances[perf-1].caption.uk']).toBe(OPUS_VALIDATION_MESSAGES.captionTooLong);
      expect(result.current.errors['performances[perf-2].caption.en']).toBe(OPUS_VALIDATION_MESSAGES.performanceSignature);
      expect(result.current.errors['performances[perf-3].caption.en']).toBe(OPUS_VALIDATION_MESSAGES.nameTooShort);
      expect(result.current.errors['performances[perf-4].caption.en']).toBe(OPUS_VALIDATION_MESSAGES.captionTooLong);
      expect(result.current.errors['performances[perf-5].caption.uk']).toBe(OPUS_VALIDATION_MESSAGES.performanceSignature);
      expect(result.current.errors['performances[perf-6].caption.uk']).toBe(OPUS_VALIDATION_MESSAGES.nameTooShort);
    });

    it('should trigger validation errors for photos altText and caption length', async () => {
      const longText = 'a'.repeat(251);

      const customOpus = {
        ...mockFetchedOpus,
        gallery: [
          {
            id: 'photo-1',
            src: 'img1.jpg',
            altText: { uk: longText, en: 'Valid' },
            description: { uk: '', en: '' },
            crop: null
          },
          {
            id: 'photo-2',
            src: 'img2.jpg',
            altText: { uk: 'Valid', en: '' },
            description: { uk: '', en: '' },
            crop: null
          },
          {
            id: 'photo-3',
            src: 'img3.jpg',
            altText: { uk: 'Valid', en: 'a' },
            description: { uk: 'a', en: '' },
            crop: null
          },
          {
            id: 'photo-4',
            src: 'img4.jpg',
            altText: { uk: 'Valid', en: longText },
            description: { uk: 'Valid', en: 'a' },
            crop: null
          },
          {
            id: 'photo-5',
            src: 'img5.jpg',
            altText: { uk: '', en: 'Valid' },
            description: { uk: '', en: '' },
            crop: null
          },
          {
            id: 'photo-6',
            src: 'img6.jpg',
            altText: { uk: 'a', en: 'Valid' },
            description: { uk: '', en: '' },
            crop: null
          }
        ]
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: customOpus },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData).not.toBeNull());
      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors['photos[photo-1].altText.uk']).toBe(OPUS_VALIDATION_MESSAGES.captionTooLong);
      expect(result.current.errors['photos[photo-2].altText.en']).toBe(OPUS_VALIDATION_MESSAGES.photoAltText);
      expect(result.current.errors['photos[photo-3].altText.en']).toBe(OPUS_VALIDATION_MESSAGES.photoTextTooShort);
      expect(result.current.errors['photos[photo-4].altText.en']).toBe(OPUS_VALIDATION_MESSAGES.captionTooLong);
      expect(result.current.errors['photos[photo-5].altText.uk']).toBe(OPUS_VALIDATION_MESSAGES.photoAltText);
      expect(result.current.errors['photos[photo-6].altText.uk']).toBe(OPUS_VALIDATION_MESSAGES.photoTextTooShort);

      expect(result.current.errors['photos[photo-3].caption.uk']).toBe(OPUS_VALIDATION_MESSAGES.photoTextTooShort);
      expect(result.current.errors['photos[photo-4].caption.en']).toBe(OPUS_VALIDATION_MESSAGES.photoTextTooShort);
    });

    it('should trigger validation errors when groupTitle.en is missing or too short', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            name: { uk: 'Валідна назва', en: '' }
          }
        },
        loading: false
      });

      const { result: resultMissing } = renderHook(() => useGroupContent('test-id-missing'));
      await waitFor(() => expect(resultMissing.current.groupData).not.toBeNull());
      await act(async () => {
        await resultMissing.current.handlePublishClick();
      });

      expect(resultMissing.current.errors['groupTitle.en']).toBe(OPUS_VALIDATION_MESSAGES.nameRequired);
      expect(resultMissing.current.currentLanguage).toBe('EN');

      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            name: { uk: 'Валідна назва', en: 'A' }
          }
        },
        loading: false
      });

      const { result: resultShort } = renderHook(() => useGroupContent('test-id-short'));
      await waitFor(() => expect(resultShort.current.groupData).not.toBeNull());
      await act(async () => {
        await resultShort.current.handlePublishClick();
      });

      expect(resultShort.current.errors['groupTitle.en']).toBe(OPUS_VALIDATION_MESSAGES.nameTooShort);
      expect(resultShort.current.currentLanguage).toBe('EN');
    });

    it('should validate Ukrainian and English photo captions that exceed the limit', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            gallery: [
              {
                id: 'photo-uk-caption',
                src: 'uk.jpg',
                description: { uk: 'a'.repeat(251), en: '' },
                altText: { uk: 'Valid alt', en: 'Valid alt' },
                crop: null
              },
              {
                id: 'photo-en-caption',
                src: 'en.jpg',
                description: { uk: '', en: 'a'.repeat(251) },
                altText: { uk: 'Valid alt', en: 'Valid alt' },
                crop: null
              }
            ]
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors['photos[photo-uk-caption].caption.uk']).toBe(OPUS_VALIDATION_MESSAGES.captionTooLong);
      expect(result.current.errors['photos[photo-en-caption].caption.en']).toBe(OPUS_VALIDATION_MESSAGES.captionTooLong);
      expect(result.current.currentLanguage).toBe('EN');
    });

    it('should block publishing when composition names are duplicated or empty', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            compositions: [
              { id: 'first', name: { uk: 'Same' }, genre: '', year: 1920, audios: [], sheetMusic: [] },
              { id: 'second', name: { uk: 'same' }, genre: '', year: 1920, audios: [], sheetMusic: [] }
            ]
          }
        },
        loading: false
      });
      const duplicateResult = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await duplicateResult.result.current.handlePublishClick();
      });
      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_DUPLICATE_ERROR);

      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            compositions: [{ id: 'empty', name: { uk: ' ' }, genre: '', year: 1920, audios: [], sheetMusic: [] }]
          }
        },
        loading: false
      });
      const emptyResult = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await emptyResult.result.current.handlePublishClick();
      });
      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_NAME_REQUIRED_ERROR);
      expect(emptyResult.result.current.errors['compositions.empty.name']).toBe('');
    });

    it('should trigger validation error when performance URL is missing but row is not empty', async () => {
      const customOpus = {
        ...mockFetchedOpus,
        performances: [
          {
            id: 'perf-no-url',
            videoUrl: '',
            title: { uk: 'Valid caption', en: 'Valid caption' }
          }
        ]
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: customOpus },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData).not.toBeNull());

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(result.current.errors['performances[perf-no-url].url']).toBe(OPUS_VALIDATION_MESSAGES.performanceUrl);
    });

    it('should preserve explicit block order and clear composition errors when compositions change', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            blocksOrder: ['works', 'details'],
            compositions: [
              { id: 'first', name: { uk: 'Same' }, genre: '', year: 1920, audios: [], sheetMusic: [] },
              { id: 'second', name: { uk: 'same' }, genre: '', year: 1920, audios: [], sheetMusic: [] }
            ]
          }
        },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData?.blocksOrder).toEqual(['works', 'details']));
      await act(async () => {
        await result.current.handlePublishClick();
      });
      expect(result.current.errors).toEqual({});

      act(() => {
        result.current.handleFieldChange('compositions', [
          { id: 'first', name: 'Unique', genre: '', year: '', audios: [], notes: [] }
        ]);
      });
      expect(result.current.errors).toEqual({});
    });

    it('should map notes without URLs and preserve direct crop coordinates', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => expect(result.current.groupData).not.toBeNull());
      act(() => {
        result.current.handleFieldChange('photos', [
          {
            id: 'photo-direct-crop',
            src: 'photo.jpg',
            caption: { uk: '', en: '' },
            altText: { uk: 'Alt', en: 'Alt' },
            crop: { x: 1, y: 2, width: 3, height: 4 }
          }
        ]);
        result.current.handleFieldChange('compositions', [
          {
            id: 'composition-note',
            name: 'Composition',
            genre: '',
            year: '',
            audios: [],
            notes: [{ id: 'note', name: 'Note', fileUrl: null, publishDate: '' }]
          }
        ]);
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      const input = mockUpdateOpus.mock.calls[0][0].variables.input;
      expect(input.compositions[0].notes[0].fileUrl).toBeNull();
      expect(input.gallery[0].crop).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });
  });

  describe('Composition validation from menu actions', () => {
    it('should show duplicate-name feedback when publishing from the menu', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            compositions: [
              { id: 'first', name: { uk: 'Same' }, genre: '', year: 1920, audios: [], sheetMusic: [] },
              { id: 'second', name: { uk: 'same' }, genre: '', year: 1920, audios: [], sheetMusic: [] }
            ]
          }
        },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handleMenuOptionClick('PUBLISH');
      });

      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_DUPLICATE_ERROR);
    });

    it('should show required-name feedback when publishing an empty composition from the menu', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            compositions: [{ id: 'empty', name: { uk: ' ' }, genre: '', year: 1920, audios: [], sheetMusic: [] }]
          }
        },
        loading: false
      });
      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handleMenuOptionClick('PUBLISH');
      });

      expect(toast.error).toHaveBeenCalledWith(COMPOSITION_NAME_REQUIRED_ERROR);
    });
  });

  describe('Navigation', () => {
    it('should navigate to edit page on handleBackClick if "from" param is "edit"', () => {
      const mockSearchParams = { get: jest.fn().mockReturnValue('edit') };
      jest.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(mockSearchParams as any);

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleBackClick();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/creativity/group/test-id/edit');
    });

    it('should navigate to creativity page on handleBackClick if "from" param is absent', () => {
      const mockSearchParams = { get: jest.fn().mockReturnValue(null) };
      jest.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(mockSearchParams as any);

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleBackClick();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/creativity');
    });
  });
  describe('Saving', () => {
    it('should forcefully trigger none handleSave', async () => {
      const originalSplit = String.prototype.split;
      jest.spyOn(String.prototype, 'split').mockImplementation(function (this: string, separator: any, limit?: any) {
        if (this === 'trigger-empty-split') return [] as unknown as string[];
        return originalSplit.call(this, separator, limit);
      });

      const edgeOpus = {
        ...mockFetchedOpus,
        number: '100',
        name: { uk: 'Valid Name', en: '' },
        creationYear: 2020,
        numberKind: 'op',

        gallery: [
          {
            id: 'photo-edge',
            src: '',
            description: { uk: '', en: '' },
            altText: { uk: '', en: '' },
            crop: undefined
          }
        ],
        compositions: [
          {
            id: 'comp-edge',
            title: { uk: 'T' },
            audios: [{ name: null, url: 'trigger-empty-split' }],
            sheetMusic: undefined
          }
        ]
      };

      (useOpusById as jest.Mock).mockReturnValue({
        data: { opusById: edgeOpus },
        loading: false
      });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));
      await waitFor(() => expect(result.current.groupData).not.toBeNull());

      act(() => {
        result.current.handleFieldChange('groupNumber', '100');
        result.current.handleFieldChange('titlePrefix', 'op');
        result.current.handleFieldChange('creationYear', '2020');
        result.current.handleFieldChange('groupTitle', { uk: 'Valid Name Ukr', en: 'Valid Name Eng' });
        result.current.handleFieldChange('additionalText', '');
        result.current.handleFieldChange('genre', { uk: '   ', en: '   ' });
        result.current.handleFieldChange('parts', { uk: '', en: undefined });
        result.current.handleFieldChange('description', { uk: null, en: '' });
        result.current.handleFieldChange('compositions', [
          {
            id: 'c3',
            name: 'T',
            genre: '   ',
            year: '   ',
            audios: undefined,
            notes: undefined
          } as unknown as OpusCompositionData
        ]);
      });

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(toast.error).not.toHaveBeenCalled();
      expect(mockUpdateOpus).toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });
});
