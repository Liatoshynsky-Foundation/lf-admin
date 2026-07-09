import { act, renderHook, waitFor } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';
import toast from 'react-hot-toast';

import { useGroupContent } from './useGroupContent';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useOpusById } from '~/shared/hooks/use-opuses/useOpuses';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';
import { useUpdateOpusMutation } from '~/types/graphql/generated/graphql';

const mockNavigate = jest.fn();
const mockUpdateOpus = jest.fn();

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
  useOpusById: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpdateOpusMutation: jest.fn(),
  OpusNumberKind: { Op: 'op', Woo: 'woo' },
  OpusStatus: { Draft: 'draft', Published: 'published' }
}));

const mockFetchedOpus = {
  id: 'test-id',
  numberKind: 'op',
  number: '42',
  name: { uk: 'Test Opus UK', en: 'Test Opus EN' },
  additionalText: 'bis',
  genre: 'Symphony',
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
    (useUpdateOpusMutation as jest.Mock).mockReturnValue([mockUpdateOpus, { loading: false }]);
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

        expect(result.current.groupData?.works[0].audios[0].name).toBe('track.mp3');
        expect(result.current.groupData?.works[0].notes[0].name).toBe('');
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
        expect(result.current.groupData?.titlePrefix).toBe('Op.');
        expect(result.current.groupData?.genre).toBe('Symphony');
        expect(result.current.publishedTitle.uk).toBe('Test Opus UK');
      });
    });

    it('should correctly parse invalid JSON description, map "woo" prefix, and strip "op." from number', async () => {
      (useOpusById as jest.Mock).mockReturnValue({
        data: {
          opusById: {
            ...mockFetchedOpus,
            numberKind: 'woo',
            number: 'op. 15',
            introDescription: { uk: 'Plain text description', en: null },
            gallery: null,
            compositions: null
          }
        },
        loading: false
      });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await waitFor(() => {
        expect(result.current.groupData?.titlePrefix).toBe('Bo.');
        expect(result.current.groupData?.groupNumber).toBe('15');
        expect(result.current.groupData?.description.uk).toEqual({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Plain text description' }] }]
        });
        expect(result.current.groupData?.description.en).toEqual({ type: 'doc', content: [] });
        expect(result.current.groupData?.photos).toEqual([]);
        expect(result.current.groupData?.works).toEqual([]);
      });
    });

    it('should handle errors during data fetching', () => {
      const mockError = new Error('Failed to fetch');
      (useOpusById as jest.Mock).mockReturnValue({ data: undefined, loading: false, error: mockError });

      const { result } = renderHook(() => useGroupContent('test-id'));

      expect(result.current.error).toBe(mockError);
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
      expect(result.current.anchors['publish']).toBeUndefined();
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

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Помилка при збереженні. Перевірте консоль.');
      consoleSpy.mockRestore();
    });
    it('should strip temporary IDs (starting with photo- or containing -) on save', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({});

      const { result } = renderHook(() => useGroupContent('test-id'));

      act(() => {
        result.current.handleFieldChange('photos', [
          { id: 'photo-12345', src: 'img1.jpg', caption: { uk: '', en: '' }, altText: { uk: '', en: '' }, crop: null },
          { id: '60d5ec49f1', src: 'img2.jpg', caption: { uk: '', en: '' }, altText: { uk: '', en: '' }, crop: null } // Справжній ID
        ]);
        result.current.handleFieldChange('performances', [
          { id: 'temp-perf-123', url: 'url1', caption: { uk: '1', en: '1' } }
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
            gallery: [{ id: 'photo-1', src: 'img.jpg', crop: null, altText: null, description: null }],
            performances: [
              { id: 'perf-1', title: null, videoUrl: null } // Completely empty performance
            ]
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

      // Перевірка, що порожній перформанс відфільтровано
      expect(calledInput.performances).toHaveLength(0);
      // Перевірка, що crop залишився null
      expect(calledInput.gallery[0].crop).toBeNull();
    });
    it('should clear temporary IDs for photos/performances on save', async () => {
      const customOpus = {
        ...mockFetchedOpus,
        gallery: [
          { id: 'photo-123', src: 'img.jpg', crop: null },
          { id: '60d5ec49f1', src: 'img2.jpg', crop: null }
        ],
        performances: [
          { id: 'perf-456', videoUrl: 'url1' },
          { id: '60d5ec49f2', videoUrl: 'url2' }
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

    it('should handle save error (catch block) and show error toast', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockRejectedValue(new Error('Server error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(toast.error).toHaveBeenCalledWith('Помилка при збереженні. Перевірте консоль.');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return early from handlePublishClick if isSaving is true', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      (useUpdateOpusMutation as jest.Mock).mockReturnValue([mockUpdateOpus, { loading: true }]);

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
      expect(result.current.errors.groupNumber).toBe('Номер має бути цілим позитивним числом.');
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

      expect(result.current.errors.groupTitle).toBe('Обов’язкове поле');
      expect(result.current.errors.creationYear).toBe('Обов’язкове поле');
      expect(toast.error).toHaveBeenCalledWith('Заповніть усі обов’язкові поля перед публікацією.');
    });

    it('should successfully save data and show success toast on handlePublishClick', async () => {
      (useOpusById as jest.Mock).mockReturnValue({ data: { opusById: mockFetchedOpus }, loading: false });
      mockUpdateOpus.mockResolvedValue({ data: { updateOpus: { id: 'test-id' } } });

      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handlePublishClick();
      });

      expect(mockUpdateOpus).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Контент успішно збережено!');
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

    it('should bypass validation for DELETE option', async () => {
      const { result } = renderHook(() => useGroupContent('test-id'));

      await act(async () => {
        await result.current.handleMenuOptionClick('DELETE');
      });

      expect(mockUpdateOpus).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
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
});
