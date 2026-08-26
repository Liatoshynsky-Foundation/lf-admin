import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';

import { ArchiveCaseModal } from './ArchiveCaseModal';
import { useArchiveCaseModal } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useCreateCase, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import { CaseStatus,useCreateAssetMutation } from '~/types/graphql/generated/graphql';

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
  MediaModal: ({
    open,
    initial,
    mediaKind,
    onClose,
    onApply,
    renderers
  }: {
    open?: boolean;
    initial?: { tab: string };
    mediaKind?: string;
    onClose?: () => void;
    onApply?: (res: any) => void;
    renderers?: { upload?: (props: any) => React.ReactNode };
  }) =>
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
          onClick={() =>
            onApply?.({
              selected: { kind: 'upload' },
              uploadResult: undefined
            })
          }
        >
          Apply Upload No Result
        </button>
        <button
          data-testid="media-apply-gallery-btn"
          onClick={() =>
            onApply?.({
              selected: {
                kind: 'gallery',
                fileName: 'gallery-file.pdf',
                src: 'https://example.com/gallery-file.pdf'
              }
            })
          }
        >
          Apply Gallery
        </button>
        <button
          data-testid="media-apply-used-btn"
          onClick={() =>
            onApply?.({
              selected: {
                kind: 'used',
                fileName: 'used-file.pdf',
                src: 'https://example.com/used-file.pdf'
              }
            })
          }
        >
          Apply Used
        </button>
        <button
          data-testid="media-apply-unknown-btn"
          onClick={() =>
            onApply?.({
              selected: { kind: 'unknown' }
            })
          }
        >
          Apply Unknown
        </button>
        <div data-testid="media-renderer-upload">
          {renderers?.upload?.({ selected: null, onPick: jest.fn() })}
        </div>
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
const defaultProps = {
  isOpen: true,
  setIsOpen: mockSetIsOpen
};

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
  beforeEach(() => {
    jest.clearAllMocks();
    (useArchiveCaseModal as jest.Mock).mockReturnValue(defaultHookValues);
    (useCreateCase as jest.Mock).mockReturnValue([mockCreateCase]);
    (useUpdateCase as jest.Mock).mockReturnValue([mockUpdateCase]);
    (useCreateAssetMutation as jest.Mock).mockReturnValue([mockCreateAsset]);
  });

  describe('rendering / basic props', () => {
    it('initializes useArchiveCaseModal hook and passes props to ArchiveCaseModalView', () => {
      render(<ArchiveCaseModal {...defaultProps} />);

      expect(useArchiveCaseModal).toHaveBeenCalledWith({ setIsOpen: mockSetIsOpen });
      expect(screen.getByTestId('archive-case-modal-view')).toBeInTheDocument();
      expect(screen.getByTestId('view-is-open')).toHaveTextContent('true');
      expect(screen.getByTestId('view-case-number')).toHaveTextContent('CASE-99');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('create');
    });

    it('passes mode="edit" to ArchiveCaseModalView when provided', () => {
      render(<ArchiveCaseModal {...defaultProps} mode="edit" />);

      expect(screen.getByTestId('view-mode')).toHaveTextContent('edit');
    });

    it('passes initialData to useArchiveCaseModal hook when provided (no fundId/caseId)', () => {
      const initialData = { caseNumber: 'CASE-123' };
      render(<ArchiveCaseModal {...defaultProps} initialData={initialData} />);

      expect(useArchiveCaseModal).toHaveBeenCalledWith({
        setIsOpen: mockSetIsOpen,
        initialData
      });
    });

    it('does not render MediaModal when isUploadModalOpen is false', () => {
      render(<ArchiveCaseModal {...defaultProps} />);

      expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
    });

    it('renders MediaModal and handles close when isUploadModalOpen is true', async () => {
      const user = userEvent.setup();
      (useArchiveCaseModal as jest.Mock).mockReturnValue({
        ...defaultHookValues,
        isUploadModalOpen: true
      });

      render(<ArchiveCaseModal {...defaultProps} />);

      expect(screen.getByTestId('media-modal')).toBeInTheDocument();
      expect(screen.getByTestId('media-kind')).toHaveTextContent('pdf');

      await user.click(screen.getByTestId('media-close-btn'));
      expect(mockHandleCloseUploadFlow).toHaveBeenCalledTimes(1);
    });

    it('passes accept/error props down to UploadView via renderers.upload', () => {
      (useArchiveCaseModal as jest.Mock).mockReturnValue({
        ...defaultHookValues,
        isUploadModalOpen: true
      });

      render(<ArchiveCaseModal {...defaultProps} />);

      expect(screen.getByTestId('upload-view')).toBeInTheDocument();
    });
  });

  describe('handleApplyPdf - upload branch', () => {
    beforeEach(() => {
      (useArchiveCaseModal as jest.Mock).mockReturnValue({
        ...defaultHookValues,
        isUploadModalOpen: true
      });
    });

    it('creates asset, applies pdf to form, shows success toast and closes flow on success', async () => {
      const user = userEvent.setup();
      const createdAsset = {
        filename: 'stored-file.pdf',
        url: 'https://example.com/file.pdf',
        mimeType: 'application/pdf'
      };
      mockCreateAsset.mockResolvedValue({ data: { createAsset: createdAsset } });

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-upload-btn'));

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
      const user = userEvent.setup();
      const createdAsset = {
        filename: 'stored-file2.pdf',
        url: 'https://example.com/file2.pdf',
        mimeType: 'application/pdf'
      };
      mockCreateAsset.mockResolvedValue({ data: { createAsset: createdAsset } });

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-upload-no-original-btn'));

      expect(mockCreateAsset).toHaveBeenCalledWith({
        variables: {
          input: expect.objectContaining({
            filename: 'stored-file2.pdf'
          })
        }
      });
      expect(mockHandleApplyPdf).toHaveBeenCalledWith({ uploadResult: createdAsset });
    });

    it('shows error toast and does not apply pdf when createAsset returns no asset', async () => {
      const user = userEvent.setup();
      mockCreateAsset.mockResolvedValue({ data: { createAsset: null } });

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-upload-btn'));

      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Не вдалося завантажити PDF файл');
      expect(mockHandleCloseUploadFlow).not.toHaveBeenCalled();
    });

    it('shows error toast with error message when createAsset mutation rejects with an Error', async () => {
      const user = userEvent.setup();
      mockCreateAsset.mockRejectedValue(new Error('Network failure'));

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-upload-btn'));

      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Network failure');
    });

    it('shows generic error toast when createAsset mutation rejects with a non-Error value', async () => {
      const user = userEvent.setup();
      mockCreateAsset.mockRejectedValue('some string failure');

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-upload-btn'));

      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Не вдалося завантажити файл.');
    });

    it('does nothing (no createAsset call) when uploadResult is missing', async () => {
      const user = userEvent.setup();

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-upload-no-result-btn'));

      expect(mockCreateAsset).not.toHaveBeenCalled();
      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
    });
  });

  describe('handleApplyPdf - gallery/used branch', () => {
    beforeEach(() => {
      (useArchiveCaseModal as jest.Mock).mockReturnValue({
        ...defaultHookValues,
        isUploadModalOpen: true
      });
    });

    it('applies pdf directly from gallery selection and closes flow', async () => {
      const user = userEvent.setup();

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-gallery-btn'));

      expect(mockCreateAsset).not.toHaveBeenCalled();
      expect(mockHandleApplyPdf).toHaveBeenCalledWith({
        uploadResult: {
          filename: 'gallery-file.pdf',
          url: 'https://example.com/gallery-file.pdf',
          mimeType: 'application/pdf'
        }
      });
      expect(mockHandleCloseUploadFlow).toHaveBeenCalledTimes(1);
    });

    it('applies pdf directly from "used" selection and closes flow', async () => {
      const user = userEvent.setup();

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-used-btn'));

      expect(mockHandleApplyPdf).toHaveBeenCalledWith({
        uploadResult: {
          filename: 'used-file.pdf',
          url: 'https://example.com/used-file.pdf',
          mimeType: 'application/pdf'
        }
      });
      expect(mockHandleCloseUploadFlow).toHaveBeenCalledTimes(1);
    });

    it('does nothing for an unrecognized selection kind', async () => {
      const user = userEvent.setup();

      render(<ArchiveCaseModal {...defaultProps} />);

      await user.click(screen.getByTestId('media-apply-unknown-btn'));

      expect(mockCreateAsset).not.toHaveBeenCalled();
      expect(mockHandleApplyPdf).not.toHaveBeenCalled();
      expect(mockHandleCloseUploadFlow).not.toHaveBeenCalled();
    });
  });

  describe('onSave callback passed into useArchiveCaseModal (fundId/caseId provided)', () => {
    it('does not include onSave in hook args when neither fundId nor caseId is provided', () => {
      render(<ArchiveCaseModal {...defaultProps} />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];
      expect(callArgs.onSave).toBeUndefined();
    });

    it('builds create-case mutation input, calls createCase, shows success toast and calls onSaved (fundId only)', async () => {
      const onSaved = jest.fn();
      render(<ArchiveCaseModal {...defaultProps} fundId="FUND-1" onSaved={onSaved} />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];
      expect(typeof callArgs.onSave).toBe('function');

      const input = {
        descriptionNumber: '1',
        caseNumber: 'CASE-1',
        name: 'My Case',
        dates: '2026',
        sheetsNumber: '5',
        nameDescription: 'short desc',
        contentDescription: 'long desc',
        pdfUrl: 'https://example.com/files/document-123.pdf',
        order: 3
      };

      await callArgs.onSave(input);

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
        order: 3,
        status: CaseStatus.Draft
      });
      expect(mockUpdateCase).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Справу успішно додано');
      expect(onSaved).toHaveBeenCalledTimes(1);
    });

    it('builds update-case mutation input (without fundId in payload), calls updateCase, shows success toast and calls onSaved (caseId provided)', async () => {
      const onSaved = jest.fn();
      render(<ArchiveCaseModal {...defaultProps} fundId="FUND-1" caseId="CASE-ID-1" onSaved={onSaved} />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];

      const input = {
        descriptionNumber: '2',
        caseNumber: 'CASE-2',
        name: 'Updated Case',
        dates: '2027',
        sheetsNumber: '7',
        nameDescription: 'updated short desc',
        contentDescription: '',
        pdfUrl: undefined,
        order: undefined
      };

      await callArgs.onSave(input);

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

    it('derives an empty filename when pdfUrl ends with a trailing slash (split().pop() yields "")', async () => {
      // Note: `url.split('/').pop() ?? 'document.pdf'` only falls back on null/undefined.
      // split() on a non-empty string always returns at least one element, and when the
      // url ends in '/', pop() returns '' (empty string) rather than undefined, so the
      // 'document.pdf' fallback is never actually reached in practice.
      render(<ArchiveCaseModal {...defaultProps} fundId="FUND-1" />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];

      await callArgs.onSave({
        descriptionNumber: '1',
        caseNumber: 'CASE-1',
        name: 'My Case',
        dates: '2026',
        sheetsNumber: '5',
        nameDescription: 'short desc',
        contentDescription: 'desc',
        pdfUrl: 'https://example.com/files/'
      });

      expect(mockCreateCase).toHaveBeenCalledWith(
        expect.objectContaining({
          pdfFile: expect.objectContaining({ filename: '' })
        })
      );
    });

    it('derives the filename from the last path segment for a normal pdfUrl', async () => {
      render(<ArchiveCaseModal {...defaultProps} fundId="FUND-1" />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];

      await callArgs.onSave({
        descriptionNumber: '1',
        caseNumber: 'CASE-1',
        name: 'My Case',
        dates: '2026',
        sheetsNumber: '5',
        nameDescription: 'short desc',
        contentDescription: 'desc',
        pdfUrl: 'https://example.com/files/report.pdf'
      });

      expect(mockCreateCase).toHaveBeenCalledWith(
        expect.objectContaining({
          pdfFile: expect.objectContaining({ filename: 'report.pdf' })
        })
      );
    });

    it('omits pdfFile from mutation input when pdfUrl is not provided', async () => {
      render(<ArchiveCaseModal {...defaultProps} fundId="FUND-1" />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];

      await callArgs.onSave({
        descriptionNumber: '1',
        caseNumber: 'CASE-1',
        name: 'My Case',
        dates: '2026',
        sheetsNumber: '5',
        nameDescription: 'short desc',
        contentDescription: 'desc'
      });

      const mutationInput = mockCreateCase.mock.calls[0][0];
      expect(mutationInput).not.toHaveProperty('pdfFile');
    });

    it('omits order from mutation input when order is undefined', async () => {
      render(<ArchiveCaseModal {...defaultProps} fundId="FUND-1" />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];

      await callArgs.onSave({
        descriptionNumber: '1',
        caseNumber: 'CASE-1',
        name: 'My Case',
        dates: '2026',
        sheetsNumber: '5',
        nameDescription: 'short desc',
        contentDescription: 'desc'
      });

      const mutationInput = mockCreateCase.mock.calls[0][0];
      expect(mutationInput).not.toHaveProperty('order');
    });

    it('includes order: 0 in mutation input (falsy-but-defined edge case)', async () => {
      render(<ArchiveCaseModal {...defaultProps} fundId="FUND-1" />);

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];

      await callArgs.onSave({
        descriptionNumber: '1',
        caseNumber: 'CASE-1',
        name: 'My Case',
        dates: '2026',
        sheetsNumber: '5',
        nameDescription: 'short desc',
        contentDescription: 'desc',
        order: 0
      });

      const mutationInput = mockCreateCase.mock.calls[0][0];
      expect(mutationInput).toHaveProperty('order', 0);
    });

    it('passes both initialData and onSave to the hook when fundId/caseId and initialData are provided together', () => {
      const initialData = { caseNumber: 'CASE-123' };
      render(
        <ArchiveCaseModal
          {...defaultProps}
          fundId="FUND-1"
          caseId="CASE-ID-1"
          initialData={initialData}
        />
      );

      const callArgs = (useArchiveCaseModal as jest.Mock).mock.calls[0][0];
      expect(callArgs.setIsOpen).toBe(mockSetIsOpen);
      expect(callArgs.initialData).toEqual(initialData);
      expect(typeof callArgs.onSave).toBe('function');
    });
  });
});
