import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ArchiveCaseModalView, ArchiveCaseModalViewProps } from './ArchiveCaseModalView';
import { ARCHIVE_CASE_MODAL_LABELS } from '~/constants/archive';

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
const mockSetDescriptionNumber = jest.fn();
const mockSetCaseNumber = jest.fn();
const mockSetSheetsNumber = jest.fn();
const mockSetCaseDate = jest.fn();
const mockSetCaseName = jest.fn();
const mockSetCaseDescriptions = jest.fn();
const mockSetDetailedCaseDescription = jest.fn();
const mockHandleOpenUploadFlow = jest.fn();
const mockHandleDeletePdf = jest.fn();
const mockHandleSave = jest.fn();
const mockHandleCancel = jest.fn();
const mockOnClose = jest.fn();

const defaultProps: ArchiveCaseModalViewProps = {
  isOpen: true,
  descriptionNumber: '',
  setDescriptionNumber: mockSetDescriptionNumber,
  caseNumber: '',
  onClose: mockOnClose,
  setCaseNumber: mockSetCaseNumber,
  sheetsNumber: '',
  setSheetsNumber: mockSetSheetsNumber,
  caseDate: '',
  setCaseDate: mockSetCaseDate,
  currentPdfFile: { fileName: null, name: null },
  detailedCaseDescription: '',
  setDetailedCaseDescription: mockSetDetailedCaseDescription,
  caseName: '',
  setCaseName: mockSetCaseName,
  caseDescriptions: '',
  setCaseDescriptions: mockSetCaseDescriptions,
  handleOpenUploadFlow: mockHandleOpenUploadFlow,
  handleDeletePdf: mockHandleDeletePdf,
  handleSave: mockHandleSave,
  handleCancel: mockHandleCancel,
  isSubmitDisabled: true,
};

describe('ArchiveCaseModalView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should render all UI elements without values', () => {
    render(<ArchiveCaseModalView {...defaultProps} />);

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

    expect(screen.getByTestId('label-row')).toHaveTextContent(ARCHIVE_CASE_MODAL_LABELS.detailedDescription);
  });

  it('should call dedicated handlers for values when typed', async () => {
    const user = userEvent.setup();
    render(<ArchiveCaseModalView {...defaultProps} />);

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

  it('should call handleOpenUploadFlow when add file button in LabelActionRow is clicked', async () => {
    const user = userEvent.setup();
    render(<ArchiveCaseModalView {...defaultProps} />);

    await user.click(screen.getByTestId('label-action-btn'));
    expect(mockHandleOpenUploadFlow).toHaveBeenCalledTimes(1);
  });

  it('should call onClose if close button is clicked', async ()=>{
    const user = userEvent.setup();
    render(<ArchiveCaseModalView {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: 'Закрити' });
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call handleDeletePdf when FileItem delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ArchiveCaseModalView
        {...defaultProps}
        currentPdfFile={{ fileName: 'doc.pdf', name: 'doc.pdf' }}
      />
    );

    await user.click(screen.getByTestId('file-delete-btn'));
    expect(mockHandleDeletePdf).toHaveBeenCalledTimes(1);
  });

  it('should call handleCancel 1 time when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ArchiveCaseModalView {...defaultProps} isSubmitDisabled={false} />);

    const cancelButton = screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.cancel });
    await user.click(cancelButton);

    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });

  it('should call handleSave 1 time when enabled and submit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ArchiveCaseModalView {...defaultProps} isSubmitDisabled={false} />);

    const saveButton = screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.save });
    await user.click(saveButton);

    expect(mockHandleSave).toHaveBeenCalledTimes(1);
  });

  it('should render the cancel and save buttons disabled if isSubmitDisabled is true', () => {
    render(<ArchiveCaseModalView {...defaultProps} />);

    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.save })).toBeDisabled();
    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.cancel })).toBeDisabled();
  });

  it('should render the cancel and save buttons enabled if isSubmitDisabled is false', () => {
    render(<ArchiveCaseModalView {...defaultProps} isSubmitDisabled={false} />);

    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.save })).toBeEnabled();
    expect(screen.getByRole('button', { name: ARCHIVE_CASE_MODAL_LABELS.cancel })).toBeEnabled();
  });

  it(`should render the pdf name and disable the "${ARCHIVE_CASE_MODAL_LABELS.addFile}" button if the pdf file is picked`, () => {
    render(
      <ArchiveCaseModalView
        {...defaultProps}
        currentPdfFile={{ fileName: 'file.pdf', name: 'file.pdf' }}
      />
    );

    expect(screen.getByTestId('file-item')).toBeInTheDocument();
    expect(screen.getByTestId('file-name')).toHaveTextContent('file.pdf');
    expect(screen.getByTestId('label-action-btn')).toBeDisabled();
  });
});
