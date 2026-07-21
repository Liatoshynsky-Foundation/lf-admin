import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArchiveCaseModal } from './ArchiveCaseModal';
import { ARCHIVE_CASE_MODAL_LABELS } from '~/constants/archive';
import { useArchiveCaseModal } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';

jest.mock('~/shared/components/composition-modal/actionable-suggest-item/ActionableSuggestItem', () => ({
  __esModule: true,
  default: ({
    mode,
    suggestions,
    onSelect,
    onUpload,
    onDelete,
  }: {
    mode?: string;
    suggestions?: string[];
    onSelect?: (val: string | null) => void;
    onUpload?: () => void;
    onDelete?: () => void;
  }) => (
    <div data-testid="actionable-suggest-item">
      <span data-testid="suggest-mode">{mode}</span>
      <span data-testid="suggest-items">{JSON.stringify(suggestions)}</span>
      <button data-testid="suggest-select-btn" onClick={() => onSelect?.('test-suggestion')}>Select</button>
      <button data-testid="suggest-upload-btn" onClick={onUpload}>Upload</button>
      <button data-testid="suggest-delete-btn" onClick={onDelete}>Delete</button>
    </div>
  ),
}));

jest.mock('~/shared/components/composition-modal/file-item/FileItem', () => ({
  __esModule: true,
  default: ({
    fileName,
    fileType,
    onDelete,
  }: {
    fileName?: string;
    fileType?: string;
    onDelete?: () => void;
  }) => (
    <div data-testid="file-item">
      <span data-testid="file-name">{fileName}</span>
      <span data-testid="file-type">{fileType}</span>
      <button data-testid="file-delete-btn" onClick={onDelete}>Delete</button>
    </div>
  ),
}));

jest.mock('~/shared/components/composition-modal/label-action-row/LabelActionRow', () => ({
  __esModule: true,
  default: ({
    title,
    action,
    actionButtonText,
    disabled,
  }: {
    title?: string;
    action?: () => void;
    actionButtonText?: string;
    disabled?: boolean;
  }) => (
    <div data-testid="label-action-row">
      <span data-testid="label-action-title">{title}</span>
      <button data-testid="label-action-btn" onClick={action} disabled={disabled}>
        {actionButtonText}
      </button>
    </div>
  ),
}));

jest.mock('~/shared/components/composition-modal/label-row/LabelRow', () => ({
  __esModule: true,
  default: ({ title }: { title?: string }) => (
    <div data-testid="label-row">{title}</div>
  ),
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  __esModule: true,
  MediaModal: ({
    open,
    initial,
    mediaKind,
    onClose,
    onApply,
    hideTabs,
    renderers,
  }: {
    open?: boolean;
    initial?: { tab: string };
    mediaKind?: string;
    onClose?: () => void;
    onApply?: (res: any) => void;
    hideTabs?: boolean;
    renderers?: { upload?: (props: any) => React.ReactNode };
  }) => (
    open ? (
      <div data-testid="media-modal">
        <span data-testid="media-initial">{JSON.stringify(initial)}</span>
        <span data-testid="media-kind">{mediaKind}</span>
        <span data-testid="media-hidetabs">{String(hideTabs)}</span>
        <button data-testid="media-close-btn" onClick={onClose}>Close</button>
        <button data-testid="media-apply-btn" onClick={() => onApply?.({ uploadResult: { filename: 'file.pdf' } })}>Apply</button>
        <div data-testid="media-renderer-upload">
          {renderers?.upload?.({ selected: null, onPick: jest.fn() })}
        </div>
      </div>
    ) : null
  ),
}));

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  __esModule: true,
  default: ({
    accept,
    invalidFileError,
    fileTooLargeError,
  }: {
    accept?: string;
    invalidFileError?: string;
    fileTooLargeError?: string;
  }) => (
    <div data-testid="upload-view">
      <span data-testid="upload-accept">{accept}</span>
      <span data-testid="upload-invalid-error">{invalidFileError}</span>
      <span data-testid="upload-large-error">{fileTooLargeError}</span>
    </div>
  ),
}));

const mockHandleSave = jest.fn();
const mockHandleCancel = jest.fn();
const mockSetDescriptionNumber = jest.fn();
const mockSetCaseNumber = jest.fn();
const mockSetSheetsNumber = jest.fn();
const mockSetCaseDate = jest.fn();
const mockSetCaseName = jest.fn();
const mockSetCaseDescriptions = jest.fn();
const mockSetDetailedCaseDescription = jest.fn();

const defaultHookValues = {
  descriptionNumber: '',
  setDescriptionNumber: mockSetDescriptionNumber,
  caseNumber: '',
  setCaseNumber: mockSetCaseNumber,
  sheetsNumber: '',
  setSheetsNumber: mockSetSheetsNumber,
  caseDate: '',
  setCaseDate: mockSetCaseDate,
  currentPdfFile: { fileName: null, name: null },
  setCurrentPdfFile: jest.fn(),
  detailedCaseDescription: '',
  setDetailedCaseDescription: mockSetDetailedCaseDescription,
  caseName: '',
  setCaseName: mockSetCaseName,
  caseDescriptions: '',
  setCaseDescriptions: mockSetCaseDescriptions,
  isUploadModalOpen: false,
  setIsUploadModalOpen: jest.fn(),
  handleOpenUploadFlow: jest.fn(),
  handleCloseUploadFlow: jest.fn(),
  isAllowedPdfFile: jest.fn(() => true),
  handleApplyPdf: jest.fn(),
  handleDeletePdf: jest.fn(),
  handleSelectPdfSuggestion: jest.fn(),
  pdfFileSuggestions: [],
  isSubmitDisabled: true,
  handleSubmit: jest.fn(),
  handleSave: mockHandleSave,
  handleCancel: mockHandleCancel,
  clearInputs: jest.fn(),
};
jest.mock('~/shared/hooks/use-archive-case-modal/useArchiveCaseModal');

describe('ArchiveCaseModal', () => {
  const mockSetIsOpen = jest.fn();
  const defaultProps = {
    isOpen: true,
    setIsOpen: mockSetIsOpen,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useArchiveCaseModal as jest.Mock).mockReturnValue(defaultHookValues);
  });

  it('should render the modal correctly when isOpen is true', () => {
    render(<ArchiveCaseModal {...defaultProps} />);

    expect(screen.getByText(ARCHIVE_CASE_MODAL_LABELS.title)).toBeInTheDocument();
  });

  it('should NOT render the modal correctly when isOpen is false', () => {
    render(<ArchiveCaseModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText(ARCHIVE_CASE_MODAL_LABELS.title)).not.toBeInTheDocument();
  });

  it('should render all UI elements without values', () => {
    render(<ArchiveCaseModal {...defaultProps} />);

    expect(screen.getByText(ARCHIVE_CASE_MODAL_LABELS.title)).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.description })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseNumber })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseName })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.sheets })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseDates })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.documentsComposition })).toHaveValue('');

    expect(screen.getByTestId('label-action-title')).toHaveTextContent(ARCHIVE_CASE_MODAL_LABELS.file);
    const labelActionBtn = screen.getByTestId('label-action-btn');
    expect(labelActionBtn).toHaveTextContent(ARCHIVE_CASE_MODAL_LABELS.addFile);
    expect(labelActionBtn).toBeEnabled();

    expect(screen.queryByTestId('media-modal')).not.toBeInTheDocument();

    expect(screen.getByTestId('suggest-mode')).toHaveTextContent('pdf');
    expect(screen.getByTestId('suggest-items')).toHaveTextContent(JSON.stringify([]));

    expect(screen.getByTestId('label-row')).toHaveTextContent(ARCHIVE_CASE_MODAL_LABELS.detailedDescription);
  });

  it('should call dedicated handlers for values when typed', async () => {
    const user = userEvent.setup();
    render(<ArchiveCaseModal {...defaultProps} />);

    const descriptionInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.description });
    const caseNumberInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseNumber });
    const caseNameInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseName });
    const sheetsInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.sheets });
    const caseDatesInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseDates });
    const documentsCompositionInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.documentsComposition });
    const detailedDescription = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.documents });

    await user.type(descriptionInput, '1');
    await user.type(caseNumberInput, '2');
    await user.type(caseNameInput, 'A');
    await user.type(sheetsInput, '3');
    await user.type(caseDatesInput, '4');
    await user.type(documentsCompositionInput, 'B');
    await user.type(detailedDescription, 'C');

    expect(mockSetDescriptionNumber).toHaveBeenCalledTimes(1);
    expect(mockSetDescriptionNumber).toHaveBeenCalledWith('1');

    expect(mockSetCaseNumber).toHaveBeenCalledTimes(1);
    expect(mockSetCaseNumber).toHaveBeenCalledWith('2');

    expect(mockSetCaseName).toHaveBeenCalledTimes(1);
    expect(mockSetCaseName).toHaveBeenCalledWith('A');

    expect(mockSetSheetsNumber).toHaveBeenCalledTimes(1);
    expect(mockSetSheetsNumber).toHaveBeenCalledWith('3');

    expect(mockSetCaseDate).toHaveBeenCalledTimes(1);
    expect(mockSetCaseDate).toHaveBeenCalledWith('4');

    expect(mockSetCaseDescriptions).toHaveBeenCalledTimes(1);
    expect(mockSetCaseDescriptions).toHaveBeenCalledWith('B');

    expect(mockSetDetailedCaseDescription).toHaveBeenCalledTimes(1);
    expect(mockSetDetailedCaseDescription).toHaveBeenCalledWith('C');
  });

  it('should reset all fields to initial values and call handleCancel 1 time when cancel button is clicked', async () => {
    (useArchiveCaseModal as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      isSubmitDisabled: false
    });
    const user = userEvent.setup();
    render(<ArchiveCaseModal {...defaultProps} />);

    const caseNumberInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseNumber });

    await user.type(caseNumberInput, '1');

    const cancelButton = screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.cancel });

    await user.click(cancelButton);

    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });

  it('should call handleSave 1 time when enabled and submit button is clicked', async () => {
    (useArchiveCaseModal as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      isSubmitDisabled: false
    });
    const user = userEvent.setup();
    render(<ArchiveCaseModal {...defaultProps} />);

    const caseNumberInput = screen.getByRole('textbox', { name: ARCHIVE_CASE_MODAL_LABELS.caseNumber });

    await user.type(caseNumberInput, '1');

    const saveButton = screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.save });

    await user.click(saveButton);

    expect(mockHandleSave).toHaveBeenCalledTimes(1);
  });

  it('should render the cancel and save buttons disabled if isSubmitDisabled is true', () => {
    render(<ArchiveCaseModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.save })).toBeDisabled();
    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.cancel })).toBeDisabled();
  });
  it('should render the cancel and save buttons enabled if isSubmitDisabled is false', () => {
    (useArchiveCaseModal as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      isSubmitDisabled: false
    });
    render(<ArchiveCaseModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.save })).toBeEnabled();
    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.cancel })).toBeEnabled();
  });

  it(`should render the pdf name and disable the "${ARCHIVE_CASE_MODAL_LABELS.addFile}" button if the pdf file is picked`, () => {
    const { rerender } = render(<ArchiveCaseModal {...defaultProps} />);

    (useArchiveCaseModal as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      currentPdfFile: { fileName: 'file.pdf', name: 'file.pdf' }
    });

    rerender(<ArchiveCaseModal {...defaultProps} />);

    expect(screen.getByTestId('file-item')).toBeInTheDocument();
    expect(screen.getByTestId('file-name')).toHaveTextContent('file.pdf');
  });
});
