import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ArchiveCaseModal } from './ArchiveCaseModal';
import { useArchiveCaseModal } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';

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
    renderers,
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
          data-testid="media-apply-btn"
          onClick={() => onApply?.({ uploadResult: { filename: 'file.pdf' } })}
        >
          Apply
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
  setIsOpen: mockSetIsOpen,
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
  handleSubmit: jest.fn(),
  handleSave: mockHandleSave,
  handleCancel: mockHandleCancel,
  clearInputs: jest.fn(),
};

describe('ArchiveCaseModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useArchiveCaseModal as jest.Mock).mockReturnValue(defaultHookValues);
  });

  it('should initialize useArchiveCaseModal hook and pass props to ArchiveCaseModalView', () => {
    render(<ArchiveCaseModal {...defaultProps} />);

    expect(useArchiveCaseModal).toHaveBeenCalledWith({ setIsOpen: mockSetIsOpen });
    expect(screen.getByTestId('archive-case-modal-view')).toBeInTheDocument();
    expect(screen.getByTestId('view-is-open')).toHaveTextContent('true');
    expect(screen.getByTestId('view-case-number')).toHaveTextContent('CASE-99');
    expect(screen.getByTestId('view-mode')).toHaveTextContent('create');
  });

  it('should pass mode="edit" to ArchiveCaseModalView when provided', () => {
    render(<ArchiveCaseModal {...defaultProps} mode="edit" />);

    expect(screen.getByTestId('view-mode')).toHaveTextContent('edit');
  });

  it('should not render MediaModal when isUploadModalOpen is false', () => {
    render(<ArchiveCaseModal {...defaultProps} />);

    expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();
  });

  it('should render MediaModal and pass handlers when isUploadModalOpen is true', async () => {
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

    await user.click(screen.getByTestId('media-apply-btn'));
    expect(mockHandleApplyPdf).toHaveBeenCalledTimes(1);
  });
});
