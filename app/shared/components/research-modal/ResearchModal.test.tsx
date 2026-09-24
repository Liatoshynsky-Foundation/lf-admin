import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';

import ResearchModal from './ResearchModal';
import { RESEARCH_MODAL_TITLE, RESEARCH_MUTATION_RESULTS } from '~/constants/research';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import {
  useCreateResearchWork,
  useResearchWorkAuthors,
  useUpdateResearchWork
} from '~/shared/hooks/use-research-works/useResearchWorks';
import { AssetType, ResearchWorkStatus, useCreateAssetMutation } from '~/types/graphql/generated/graphql';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('~/shared/hooks/use-research-works/useResearchWorks', () => ({
  useCreateResearchWork: jest.fn(),
  useUpdateResearchWork: jest.fn(),
  useResearchWorkAuthors: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => {
  const actual = jest.requireActual('~/types/graphql/generated/graphql');
  return {
    ...actual,
    useCreateAssetMutation: jest.fn()
  };
});

let latestMediaApply: ((result: MediaModalResult) => void) | null = null;

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({
    open,
    onApply,
    onClose
  }: {
    open: boolean;
    onApply: (result: MediaModalResult) => void;
    onClose: () => void;
  }) => {
    latestMediaApply = onApply;
    if (!open) return null;
    return (
      <div data-testid="mock-media-modal">
        <button type="button" onClick={onClose}>
          close-media
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-upload-view" />
}));

const mockedUseCreateResearchWork = jest.mocked(useCreateResearchWork);
const mockedUseUpdateResearchWork = jest.mocked(useUpdateResearchWork);
const mockedUseResearchWorkAuthors = jest.mocked(useResearchWorkAuthors);
const mockedUseCreateAssetMutation = jest.mocked(useCreateAssetMutation);

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/бібліографічний опис/i), { target: { value: 'Опис' } });
  fireEvent.change(screen.getByLabelText(/автор/i), { target: { value: 'Автор' } });
  fireEvent.change(screen.getByLabelText(/дати справи/i), { target: { value: '1970' } });
  fireEvent.change(screen.getByLabelText(/ключові слова/i), { target: { value: 'слово' } });
};

describe('ResearchModal', () => {
  const onClose = jest.fn();
  const createResearchWork = jest.fn();
  const updateResearchWork = jest.fn();
  const createAsset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    latestMediaApply = null;
    createResearchWork.mockResolvedValue({});
    updateResearchWork.mockResolvedValue({});
    createAsset.mockResolvedValue({
      data: {
        createAsset: {
          id: 'asset-1',
          filename: 'scan.pdf',
          url: 'https://cdn/doc.pdf',
          mimeType: 'application/pdf',
          type: AssetType.Pdf
        }
      }
    });
    mockedUseCreateResearchWork.mockReturnValue([createResearchWork, { loading: false }] as never);
    mockedUseUpdateResearchWork.mockReturnValue([updateResearchWork, { loading: false }] as never);
    mockedUseResearchWorkAuthors.mockReturnValue({ authors: [], loading: false, error: undefined });
    mockedUseCreateAssetMutation.mockReturnValue([createAsset] as never);
  });

  it('renders with the shared modal title for create and edit', () => {
    const { rerender } = render(<ResearchModal isOpen onClose={onClose} />);

    expect(screen.getByText(RESEARCH_MODAL_TITLE)).toBeInTheDocument();

    rerender(<ResearchModal isOpen mode="edit" onClose={onClose} />);

    expect(screen.getByText(RESEARCH_MODAL_TITLE)).toBeInTheDocument();
  });

  it('creates a research work and closes the modal on successful save', async () => {
    render(<ResearchModal isOpen onClose={onClose} />);

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/^url$/i), { target: { value: 'https://example.com/work' } });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(createResearchWork).toHaveBeenCalledWith({
        bibliographicDescription: 'Опис',
        author: 'Автор',
        year: '1970',
        keywords: 'слово',
        url: 'https://example.com/work',
        status: ResearchWorkStatus.Published
      })
    );
    expect(toast.success).toHaveBeenCalledWith(RESEARCH_MUTATION_RESULTS.created);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('attaches a gallery PDF via MediaModal and includes pdfFile on create', async () => {
    render(<ResearchModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати файл' }));
    expect(screen.getByTestId('mock-media-modal')).toBeInTheDocument();

    await act(async () => {
      await latestMediaApply?.({
        selected: {
          kind: 'gallery',
          id: 'asset-1',
          fileName: 'library.pdf',
          src: 'https://cdn/library.pdf',
          locale: 'uk'
        },
        crop: null
      });
    });

    expect(await screen.findByText('library.pdf')).toBeInTheDocument();

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(createResearchWork).toHaveBeenCalledWith(
        expect.objectContaining({
          pdfFile: {
            filename: 'library.pdf',
            url: 'https://cdn/library.pdf',
            mimeType: 'application/pdf'
          }
        })
      )
    );
  });

  it('uploads a PDF through MediaModal, creates an asset, and saves pdfFile', async () => {
    render(<ResearchModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати файл' }));

    await act(async () => {
      await latestMediaApply?.({
        selected: {
          kind: 'upload',
          id: 'upload-1',
          fileName: 'scan.pdf',
          file: new File(['pdf'], 'scan.pdf', { type: 'application/pdf' })
        },
        crop: null,
        uploadResult: {
          url: 'https://cdn/doc.pdf',
          filename: 'hashed.pdf',
          originalName: 'scan.pdf',
          mimeType: 'application/pdf',
          size: 10
        }
      });
    });

    await waitFor(() => expect(createAsset).toHaveBeenCalled());
    expect(await screen.findByText('scan.pdf')).toBeInTheDocument();

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(createResearchWork).toHaveBeenCalledWith(
        expect.objectContaining({
          pdfFile: {
            filename: 'scan.pdf',
            url: 'https://cdn/doc.pdf',
            mimeType: 'application/pdf'
          }
        })
      )
    );
  });

  it('updates an existing research work in edit mode', async () => {
    render(
      <ResearchModal
        isOpen
        mode="edit"
        workId="work-1"
        onClose={onClose}
        initialData={{
          bibliographicDescription: 'Опис',
          author: 'Автор',
          caseDates: '1970',
          keywords: 'слово',
          isVisibleOnSite: false
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(updateResearchWork).toHaveBeenCalledWith('work-1', {
        bibliographicDescription: 'Опис',
        author: 'Автор',
        year: '1970',
        keywords: 'слово',
        url: null,
        status: ResearchWorkStatus.Hidden
      })
    );
    expect(toast.success).toHaveBeenCalledWith(RESEARCH_MUTATION_RESULTS.updated);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('omits pdfFile on update when the existing PDF was not changed', async () => {
    const existingPdfFile = {
      filename: 'existing.pdf',
      url: 'https://cdn/existing.pdf',
      mimeType: 'application/pdf'
    };

    render(
      <ResearchModal
        isOpen
        mode="edit"
        workId="work-1"
        existingPdfFile={existingPdfFile}
        onClose={onClose}
        initialData={{
          bibliographicDescription: 'Опис',
          author: 'Автор',
          caseDates: '1970',
          keywords: 'слово',
          isVisibleOnSite: true
        }}
      />
    );

    expect(screen.getByText('existing.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(updateResearchWork).toHaveBeenCalledWith(
        'work-1',
        expect.not.objectContaining({ pdfFile: expect.anything() })
      )
    );
    expect(updateResearchWork.mock.calls[0][1]).not.toHaveProperty('pdfFile');
  });

  it('sends pdfFile null on update when the existing PDF is removed', async () => {
    const existingPdfFile = {
      filename: 'existing.pdf',
      url: 'https://cdn/existing.pdf',
      mimeType: 'application/pdf'
    };

    render(
      <ResearchModal
        isOpen
        mode="edit"
        workId="work-1"
        existingPdfFile={existingPdfFile}
        onClose={onClose}
        initialData={{
          bibliographicDescription: 'Опис',
          author: 'Автор',
          caseDates: '1970',
          keywords: 'слово',
          isVisibleOnSite: true
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'delete file' }));
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(updateResearchWork).toHaveBeenCalledWith(
        'work-1',
        expect.objectContaining({ pdfFile: null })
      )
    );
  });

  it('shows an error toast and keeps the modal open when create fails', async () => {
    createResearchWork.mockRejectedValue(new Error('Автор є обов’язковим.'));

    render(<ResearchModal isOpen onClose={onClose} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Автор є обов’язковим.')
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
