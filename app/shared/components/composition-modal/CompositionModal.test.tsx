import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import React from 'react';
import toast from 'react-hot-toast';

import { MediaModalResult, UploadResult } from '../media-modal/MediaModal.types';
import CompositionModal from './CompositionModal';
import { AssetType } from '~/types/graphql/generated/graphql';

interface MockCompositionModalViewProps {
  readonly isOpen: boolean;
  readonly isLoadingData: boolean;
  readonly suggestions: { readonly audio: string[]; readonly notes: string[] };
  readonly onClose: () => void;
  readonly onTriggerUpload: (mode: 'audio' | 'notes', onSuccess: (fileName: string) => void) => void;
  readonly onSave: (title: string, genre: string, year: unknown, audio: unknown[], notes: unknown[]) => Promise<void>;
}

interface MockMediaModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onApply: (result: MediaModalResult & { uploadResult?: UploadResult }) => Promise<void>;
}

const useAllAssetsMock = jest.fn();
const createAssetMutationMock = jest.fn();

jest.mock('~/shared/hooks/use-assets/useAssets', () => ({
  useAllAssets: () => useAllAssetsMock()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  AssetType: { Audio: 'AUDIO', Pdf: 'PDF' },
  useCreateAssetMutation: () => [createAssetMutationMock]
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('./composition-modal-view/CompositionModalView', () => ({
  __esModule: true,
  CompositionModalView: ({
    isOpen,
    isLoadingData,
    suggestions,
    onClose,
    onTriggerUpload,
    onSave
  }: MockCompositionModalViewProps) => {
    if (!isOpen || isLoadingData) return <div data-testid="composition-view-hidden" />;
    return (
      <div data-testid="composition-modal-view">
        <span data-testid="audio-suggestions">{JSON.stringify(suggestions.audio)}</span>
        <span data-testid="notes-suggestions">{JSON.stringify(suggestions.notes)}</span>

        <button data-testid="action-close" onClick={onClose}>
          Close View
        </button>
        <button data-testid="action-trigger-upload-audio" onClick={() => onTriggerUpload('audio', (_fileName) => {})}>
          Upload Audio Trigger
        </button>
        <button
          data-testid="action-submit-composition"
          onClick={() => onSave('Test Symphony', 'Classical', dayjs('2026-01-01'), [], [])}
        >
          Save Composition
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  __esModule: true,
  MediaModal: ({ open, onClose, onApply }: MockMediaModalProps) => {
    if (!open) return null;
    return (
      <div data-testid="media-modal">
        <button data-testid="media-modal-close" onClick={onClose}>
          Cancel Upload
        </button>
        <button
          data-testid="media-modal-apply-audio"
          onClick={() =>
            onApply({
              selected: {
                kind: 'upload',
                id: 'mock-upload-id-token',
                fileName: 'symphony.mp3',
                file: new File([''], 'symphony.mp3', { type: 'audio/mp3' })
              },
              crop: null,
              uploadResult: {
                url: 'https://storage/audio.mp3',
                filename: 'hashed_audio.mp3',
                originalName: 'symphony.mp3',
                mimeType: 'audio/mp3',
                size: 2048
              }
            })
          }
        >
          Apply Audio Upload
        </button>
      </div>
    );
  }
}));

const mockAssets = [
  { type: AssetType.Audio, filename: 'audio_1.mp3' },
  { type: AssetType.Pdf, filename: 'sheet_music.pdf' }
];

const runSimulation = (isOpen = true, loading = false, allAssets: unknown = mockAssets) => {
  useAllAssetsMock.mockReturnValue({ data: { allAssets }, loading });
  render(<CompositionModal mode="create" isOpen={isOpen} sx={{}} onClose={jest.fn()} />);
};

describe('CompositionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAssetMutationMock.mockResolvedValue({ data: { createAsset: true } });
  });

  it('should render nothing or skeleton baselines transparently when query logs are in loading states', () => {
    runSimulation(true, true);
    expect(screen.queryByTestId('composition-modal-view')).not.toBeInTheDocument();
  });

  it('should map query data into structured suggestions arrays and bind them onto the nested view layout', () => {
    runSimulation();

    expect(screen.getByTestId('composition-modal-view')).toBeInTheDocument();
    expect(screen.getByTestId('audio-suggestions')).toHaveTextContent(JSON.stringify(['audio_1.mp3']));
    expect(screen.getByTestId('notes-suggestions')).toHaveTextContent(JSON.stringify(['sheet_music.pdf']));
  });

  it('should toggle and mount the secondary media modal overlay upon nested asset upload requests', () => {
    runSimulation();

    expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('action-trigger-upload-audio'));
    expect(screen.getByTestId('media-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('media-modal-close'));
    expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
  });

  it('should process asset mutation uploads, dispatch updates to store pipelines, update cache inline, and emit status toasts on success', async () => {
    runSimulation();

    fireEvent.click(screen.getByTestId('action-trigger-upload-audio'));
    fireEvent.click(screen.getByTestId('media-modal-apply-audio'));

    await waitFor(() => {
      expect(createAssetMutationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            input: {
              filename: 'symphony.mp3',
              url: 'https://storage/audio.mp3',
              mimeType: 'audio/mp3',
              sizeBytes: 2048,
              type: 'audio'
            }
          },
          update: expect.any(Function) 
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Файл успішно завантажено');
    await waitFor(() => {
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });

  it('should surface notification errors via catch loops if asset processing requests drop or disconnect', async () => {
    createAssetMutationMock.mockRejectedValue(new Error('Network drop error'));
    runSimulation();

    fireEvent.click(screen.getByTestId('action-trigger-upload-audio'));
    fireEvent.click(screen.getByTestId('media-modal-apply-audio'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network drop error');
    });
  });

  it('should execute composition storage paths flawlessly on submission actions', async () => {
    runSimulation();

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    fireEvent.click(screen.getByTestId('action-submit-composition'));

    expect(toast.success).toHaveBeenCalledWith('Композиція успішно створена!');
    expect(consoleSpy).toHaveBeenCalledWith('Saving composition:', expect.any(Object));

    consoleSpy.mockRestore();
  });
});
