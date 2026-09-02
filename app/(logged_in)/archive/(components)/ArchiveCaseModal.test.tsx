import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';

import { ArchiveCaseModal } from './ArchiveCaseModal';
import { useArchiveCaseModal } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useCreateCase, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { CaseStatus, useCreateAssetMutation } from '~/types/graphql/generated/graphql';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockCreateCase = jest.fn();
const mockUpdateCase = jest.fn();

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useCreateCase: jest.fn(),
  useUpdateCase: jest.fn()
}));

const mockCreateAsset = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  __esModule: true,
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useCreateAssetMutation: jest.fn()
}));

jest.mock('./archive-case-modal-view/ArchiveCaseModalView', () => ({
  __esModule: true,
  ArchiveCaseModalView: (props: any) => (
    <div data-testid="archive-case-modal-view">
      <span data-testid="view-is-open">{String(props.isOpen)}</span>
      <span data-testid="view-case-number">{props.caseNumber}</span>
      <span data-testid="view-mode">{props.mode}</span>
      <button data-testid="view-open-upload-btn" onClick={props.handleOpenUploadFlow}>
        Open Upload Flow
      </button>
      <button data-testid="view-save-btn" onClick={props.handleSave}>
        Save
      </button>
      <button data-testid="view-cancel-btn" onClick={props.handleCancel}>
        Cancel
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  __esModule: true,
  MediaModal: ({ open, initial, mediaKind, onClose, onApply, renderers }: any) =>
    open ? (
      <div data-testid="media-modal">
        <span data-testid="media-initial">{JSON.stringify(initial)}</span>
        <span data-testid="media-kind">{mediaKind}</span>
        <button data-testid="media-close-btn" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="media-apply-upload-btn"
          onClick={() =>
            onApply?.({
              selected: { kind: 'upload' },
              uploadResult: {
                url: 'https://example.com/file.pdf',
                filename: 'stored-file.pdf',
                originalName: 'original-file.pdf',
                mimeType: 'application/pdf',
                size: 1234
              }
            })
          }
        >
          Apply Upload
        </button>
        <button
          data-testid="media-apply-upload-no-original-btn"
          onClick={() =>
            onApply?.({
              selected: { kind: 'upload' },
              uploadResult: {
                url: 'https://example.com/file2.pdf',
                filename: 'stored-file2.pdf',
                originalName: undefined,
                mimeType: 'application/pdf',
                size: 5678
              }
            })
          }
        >
          Apply Upload No Original Name
        </button>
        <button
          data-testid="media-apply-upload-no-result-btn"
          onClick={() => onApply?.({ selected: { kind: 'upload' }, uploadResult: undefined })}
        >
          Apply Upload No Result
        </button>
        <button
          data-testid="media-apply-gallery-btn"
          onClick={() =>
            onApply?.({
              selected: { kind: 'gallery', fileName: 'gallery-file.pdf', src: 'https://example.com/gallery-file.pdf' }
            })
          }
        >
          Apply Gallery
        </button>
        <button
          data-testid="media-apply-used-btn"
          onClick={() =>
            onApply?.({
              selected: { kind: 'used', fileName: 'used-file.pdf', src: 'https://example.com/used-file.pdf' }
            })
          }
        >
          Apply Used
        </button>
        <button data-testid="media-apply-unknown-btn" onClick={() => onApply?.({ selected: { kind: 'unknown' } })}>
          Apply Unknown
        </button>
        <div data-testid="media-renderer-upload">{renderers?.upload?.({ selected: null, onPick: jest.fn() })}</div>
      </div>
    ) : null
}));

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  __esModule: true,
  default: ({ accept, invalidFileError, fileTooLargeError }: any) => (
    <div data-testid="upload-view">
      <span data-testid="upload-accept">{accept}</span>
      <span data-testid="upload-invalid-error">{invalidFileError}</span>
      <span data-testid="upload-large-error">{fileTooLargeError}</span>
    </div>
  )
}));

jest.mock('~/shared/hooks/use-archive-case-modal/useArchiveCaseModal');
const mockSetIsOpen = jest.fn();
const defaultProps = { isOpen: true, setIsOpen: mockSetIsOpen };

const mockHandleSave = jest.fn();
const mockHandleCancel = jest.fn();
const mockHandleOpenUploadFlow = jest.fn();
const mockHandleCloseUploadFlow = jest.fn();
const mockHandleApplyPdf = jest.fn();

const defaultHookValues = {
  descriptionNumber: '1',
  setDescriptionNumber: jest.fn(),
  caseNumber: 'CASE-99',
  setCaseNumber: jest.fn(),
  sheetsNumber: '10',
  setSheetsNumber: jest.fn(),
  caseDate: '2026',
  setCaseDate: jest.fn(),
  currentPdfFile: { fileName: null, name: null },
  setCurrentPdfFile: jest.fn(),
  detailedCaseDescription: '',
  setDetailedCaseDescription: jest.fn(),
  caseName: 'Test Case',
  setCaseName: jest.fn(),
  caseDescriptions: '',
  setCaseDescriptions: jest.fn(),
  isUploadModalOpen: false,
  setIsUploadModalOpen: jest.fn(),
  handleOpenUploadFlow: mockHandleOpenUploadFlow,
  handleCloseUploadFlow: mockHandleCloseUploadFlow,
  isAllowedPdfFile: jest.fn(() => true),
  handleApplyPdf: mockHandleApplyPdf,
  handleDeletePdf: jest.fn(),
  isSubmitDisabled: false,
  isCancelDisabled: false,
  fieldErrors: {},
  handleSubmit: jest.fn(),
  handleSave: mockHandleSave,
  handleCancel: mockHandleCancel,
  clearInputs: jest.fn()
};

describe('ArchiveCaseModal', () => {
  // Хелперы для устранения дублирования в тестах
  const renderModal = (props = {}) => render(<ArchiveCaseModal {...defaultProps} {...props} />);

  const clickApply = async (testId: string) => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByTestId(testId));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useArchiveCaseModal as jest.Mock).mockReturnValue(defaultHookValues);
    (useCreateCase as jest.Mock).mockReturnValue([mockCreateCase]);
    (useUpdateCase as jest.Mock).mockReturnValue([mockUpdateCase]);
    (useCreateAssetMutation as jest.Mock).mockReturnValue([mockCreateAsset]);
  });

  describe('rendering / basic props', () => {
    it('initializes useArchiveCaseModal hook and passes props to ArchiveCaseModalView', () => {
      renderModal();
      expect(useArchiveCaseModal).toHaveBeenCalledWith({ setIsOpen: mockSetIsOpen });
      expect(screen.getByTestId('archive-case-modal-view')).toBeInTheDocument();
      expect(screen.getByTestId('view-is-open')).toHaveTextContent('true');
      expect(screen.getByTestId('view-case-number')).toHaveTextContent('CASE-99');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('create');
    });

    it('passes mode="edit" to ArchiveCaseModalView when provided', () => {
      renderModal({ mode: 'edit' });
      expect(screen.getByTestId('view-mode')).toHaveTextContent('edit');
    });

    it('passes initialData to useArchiveCaseModal hook when provided (no fundId/caseId)', () => {
      const initialData = { caseNumber: 'CASE-123' };
      renderModal({ initialData });
      expect(useArchiveCaseModal).toHaveBeenCalledWith({ setIsOpen: mockSetIsOpen, initialData });
    });

    it('does not render MediaModal when isUploadModalOpen is false', () => {
      renderModal();
      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });

    it('renders MediaModal and handles close when isUploadModalOpen is true', async () => {
      const user = userEvent.setup();
      (useArchiveCaseModal as jest.Mock).mockReturnValue({ ...defaultHookValues, isUploadModalOpen: true });
      renderModal();

      expect(screen.getByTestId('media-modal')).toBeInTheDocument();
      expect(screen.getByTestId('media-kind')).toHaveTextContent('pdf');

      await user.click(screen.getByTestId('media-close-btn'));
      expect(mockHandleCloseUploadFlow).toHaveBeenCalledTimes(1);
    });

    it('passes accept/error props down to UploadView via renderers.upload', () => {
      (useArchiveCaseModal as jest.Mock).mockReturnValue({ ...defaultHookValues, isUploadModalOpen: true });
      renderModal();
      expect(screen.getByTestId('upload-view')).toBeInTheDocument();
    });
  });

  describe('handleApplyPdf - upload branch', () => {
    beforeEach(() => {
      (useArchiveCaseModal as jest.Mock).mockReturnValue({ ...defaultHookValues, isUploadModalOpen: true });
    });

    it('creates asset, applies pdf to form, shows success toast and closes flow on success', async () => {
      const createdAsset = {
        filename: 'stored-file.pdf',
        url: 'https://example.com/file.pdf',
        mimeType: 'application/pdf'
      };
      mockCreateAsset.mockResolvedValue({ data: { createAsset: createdAsset } });

      await clickApply('media-apply-upload-btn');

      expect(mockCreateAsset).toHaveBeenCalledWith({
        variables: {
          input: {
            filename: 'original-file.pdf',
            url: 'https://example.com/file.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 1234,
            type: 'pdf'
          }
        }
      });
      expect(mockHandleApplyPdf).toHaveBeenCalledWith({ uploadResult: createdAsset });
      expect(toast.success).toHaveBeenCalledWith('Файл успішно завантажено');
      expect(mockHandleCloseUploadFlow).toHaveBeenCalledTimes(1);
    });

    it('falls back to filename when originalName is not provided', async () => {
      const createdAsset = {
        filename: 'stored-file2.pdf',
        url: 'https://example.com/file2.pdf',
        mimeType: 'application/pdf'
      };
      mockCreateAsset.mockResolvedValue({ data: { createAsset: createdAsset } });

      await clickApply('media-apply-upload-no-original-btn');

      expect(mockCreateAsset).toHaveBeenCalledWith({
        variables: { input: expect.objectContaining({ filename: 'stored-file2.pdf' }) }
      });
      expect(mockHandleApplyPdf).toHaveBeenCalledWith({ uploadResult: createdAsset });
    });

    it.each([
      ['returns no asset', { data: { createAsset: null } }, 'Не вдалося завантажити PDF файл', false],
      ['rejects with an Error', new Error('Network failure'), 'Network failure', true],
      ['rejects with a non-Error value', 'some string failure', 'Не вдалося завантажити файл.', true]
    ])('shows error toast when createAsset %s', async (_, mockValue, expectedToast, isReject) => {
      if (isReject) mockCreateAsset.mockRejectedValue(mockValue);
      else mockCreateAsset.mockResolvedValue(mockValue);

      await clickApply('media-apply-upload-btn');

      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expectedToast);
      expect(mockHandleCloseUploadFlow).not.toHaveBeenCalled();
    });

    it('does nothing (no createAsset call) when uploadResult is missing', async () => {
      await clickApply('media-apply-upload-no-result-btn');
      expect(mockCreateAsset).not.toHaveBeenCalled();
      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
    });
  });

  describe('handleApplyPdf - gallery/used branch', () => {
    beforeEach(() => {
      (useArchiveCaseModal as jest.Mock).mockReturnValue({ ...defaultHookValues, isUploadModalOpen: true });
    });

    it.each([
      [
        'gallery',
        'media-apply-gallery-btn',
        { filename: 'gallery-file.pdf', url: 'https://example.com/gallery-file.pdf', mimeType: 'application/pdf' }
      ],
      [
        'used',
        'media-apply-used-btn',
        { filename: 'used-file.pdf', url: 'https://example.com/used-file.pdf', mimeType: 'application/pdf' }
      ]
    ])('applies pdf directly from %s selection and closes flow', async (_, btnId, expectedResult) => {
      await clickApply(btnId);

      expect(mockCreateAsset).not.toHaveBeenCalled();
      expect(mockHandleApplyPdf).toHaveBeenCalledWith({ uploadResult: expectedResult });
      expect(mockHandleCloseUploadFlow).toHaveBeenCalledTimes(1);
    });

    it('does nothing for an unrecognized selection kind', async () => {
      await clickApply('media-apply-unknown-btn');

      expect(mockCreateAsset).not.toHaveBeenCalled();
      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
      expect(mockHandleCloseUploadFlow).not.toHaveBeenCalled();
    });
  });

  describe('onSave callback passed into useArchiveCaseModal', () => {
    // Хелпер для симуляции сохранения (убирает 50 строк дублирующегося объекта)
    const execSave = async (props: any, inputOverrides: any = {}) => {
      const onSaved = jest.fn();
      renderModal({ ...props, onSaved });
      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];

      if (callArgs.onSave) {
        await callArgs.onSave({
          descriptionNumber: '1',
          caseNumber: 'CASE-1',
          name: 'My Case',
          dates: '2026',
          sheetsNumber: '5',
          nameDescription: 'short desc',
          contentDescription: 'long desc',
          ...inputOverrides
        });
      }
      return { onSaved, callArgs };
    };

    it('does not include onSave in hook args when neither fundId nor caseId is provided', () => {
      renderModal();
      expect((useArchiveCaseModal as jest.Mock).mock.calls[0][0].onSave).toBeUndefined();
    });

    it('builds create-case mutation input, calls createCase, shows success toast and calls onSaved', async () => {
      const { onSaved } = await execSave(
        { fundId: 'FUND-1' },
        { pdfUrl: 'https://example.com/files/document-123.pdf' }
      );

      expect(mockCreateCase).toHaveBeenCalledWith({
        fundId: 'FUND-1',
        descriptionNumber: '1',
        caseNumber: 'CASE-1',
        caseName: { uk: 'My Case', en: 'My Case' },
        caseDate: { uk: '2026', en: '2026' },
        sheetsNumber: '5',
        caseDescriptions: { uk: 'short desc', en: 'short desc' },
        detailedCaseDescription: { uk: 'long desc', en: 'long desc' },
        pdfFile: {
          filename: 'document-123.pdf',
          url: 'https://example.com/files/document-123.pdf',
          mimeType: 'application/pdf'
        },
        status: CaseStatus.Draft
      });
      expect(mockUpdateCase).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Справу успішно додано');
      expect(onSaved).toHaveBeenCalledTimes(1);
    });

    it('builds update-case mutation input, calls updateCase, shows success toast and calls onSaved', async () => {
      const { onSaved } = await execSave(
        { fundId: 'FUND-1', caseId: 'CASE-ID-1' },
        {
          descriptionNumber: '2',
          caseNumber: 'CASE-2',
          name: 'Updated Case',
          dates: '2027',
          sheetsNumber: '7',
          nameDescription: 'updated short desc',
          contentDescription: '',
          pdfUrl: undefined
        }
      );

      expect(mockUpdateCase).toHaveBeenCalledWith({
        id: 'CASE-ID-1',
        input: {
          descriptionNumber: '2',
          caseNumber: 'CASE-2',
          caseName: { uk: 'Updated Case', en: 'Updated Case' },
          caseDate: { uk: '2027', en: '2027' },
          sheetsNumber: '7',
          caseDescriptions: { uk: 'updated short desc', en: 'updated short desc' },
          detailedCaseDescription: undefined
        }
      });
      expect(mockUpdateCase.mock.calls[0][0]).not.toHaveProperty('input.fundId');
      expect(mockCreateCase).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Справу успішно змінено');
      expect(onSaved).toHaveBeenCalledTimes(1);
    });

    it('derives an empty filename when pdfUrl ends with a trailing slash', async () => {
      await execSave({ fundId: 'FUND-1' }, { pdfUrl: 'https://example.com/files/' });
      expect(mockCreateCase).toHaveBeenCalledWith(
        expect.objectContaining({ pdfFile: expect.objectContaining({ filename: '' }) })
      );
    });

    it('derives the filename from the last path segment for a normal pdfUrl', async () => {
      await execSave({ fundId: 'FUND-1' }, { pdfUrl: 'https://example.com/files/report.pdf' });
      expect(mockCreateCase).toHaveBeenCalledWith(
        expect.objectContaining({ pdfFile: expect.objectContaining({ filename: 'report.pdf' }) })
      );
    });

    it('omits pdfFile from mutation input when pdfUrl is not provided', async () => {
      await execSave({ fundId: 'FUND-1' }, { pdfUrl: undefined });
      expect(mockCreateCase.mock.calls[0][0]).not.toHaveProperty('pdfFile');
    });

    it('passes both initialData and onSave to the hook when fundId/caseId and initialData are provided together', () => {
      const initialData = { caseNumber: 'CASE-123' };
      renderModal({ fundId: 'FUND-1', caseId: 'CASE-ID-1', initialData });

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];
      expect(callArgs.setIsOpen).toBe(mockSetIsOpen);
      expect(callArgs.initialData).toEqual(initialData);
      expect(typeof callArgs.onSave).toBe('function');
    });
  });
});