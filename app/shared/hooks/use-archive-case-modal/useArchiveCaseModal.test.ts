import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { useArchiveCaseModal, type UseArchiveCaseModalProps } from './useArchiveCaseModal';
import { INITIAL_PDF_ENTRY } from '~/constants/archive';
import { CASE_VALIDATION_MESSAGES } from '~/constants/case';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

const createMockFile = (name: string, type: string): File => {
  return new File(['dummy content'], name, { type });
};
const mockSetIsOpen = jest.fn();
const defaultProps: UseArchiveCaseModalProps = {
  setIsOpen: mockSetIsOpen,
};

describe('useArchiveCaseModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize all state values with their defaults', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      expect(result.current).toEqual({
        caseDate: '',
        caseDescriptions: '',
        caseName: '',
        caseNumber: '',
        descriptionNumber: '',
        detailedCaseDescription: '',
        sheetsNumber: '',
        isUploadModalOpen: false,
        currentPdfFile: INITIAL_PDF_ENTRY,
        fieldErrors: {},

        isSubmitDisabled: true,
        isCancelDisabled: true,

        clearInputs: expect.any(Function),
        handleApplyPdf: expect.any(Function),
        handleCancel: expect.any(Function),
        handleCloseUploadFlow: expect.any(Function),
        handleDeletePdf: expect.any(Function),
        handleOpenUploadFlow: expect.any(Function),
        handleSave: expect.any(Function),
        handleSubmit: expect.any(Function),
        isAllowedPdfFile: expect.any(Function),

        setCaseDate: expect.any(Function),
        setCaseDescriptions: expect.any(Function),
        setCaseName: expect.any(Function),
        setCaseNumber: expect.any(Function),
        setCurrentPdfFile: expect.any(Function),
        setDescriptionNumber: expect.any(Function),
        setDetailedCaseDescription: expect.any(Function),
        setIsUploadModalOpen: expect.any(Function),
        setSheetsNumber: expect.any(Function),
      });
    });

    it('should initialize state values with passed initialData', () => {
      const initialData = {
        descriptionNumber: '1',
        caseNumber: 'CASE-99',
        sheetsNumber: '10',
        caseDate: '2026',
        currentPdfFile: { fileName: 'file.pdf', name: 'file.pdf' },
        detailedCaseDescription: 'Detail',
        caseName: 'Test Case',
        caseDescriptions: 'Descriptions',
      };
      const { result } = renderHook(() => useArchiveCaseModal({ ...defaultProps, initialData }));

      expect(result.current.descriptionNumber).toBe('1');
      expect(result.current.caseNumber).toBe('CASE-99');
      expect(result.current.sheetsNumber).toBe('10');
      expect(result.current.caseDate).toBe('2026');
      expect(result.current.currentPdfFile).toEqual({ fileName: 'file.pdf', name: 'file.pdf' });
      expect(result.current.detailedCaseDescription).toBe('Detail');
      expect(result.current.caseName).toBe('Test Case');
      expect(result.current.caseDescriptions).toBe('Descriptions');
    });
  });

  describe('handleOpenUploadFlow', () => {
    it('should set isUploadModalOpen to true', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.handleOpenUploadFlow();
      });

      expect(result.current.isUploadModalOpen).toBe(true);
    });
  });

  describe('handleCloseUploadFlow', () => {
    it('should set isUploadModalOpen to false', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.handleCloseUploadFlow();
      });

      expect(result.current.isUploadModalOpen).toBe(false);
    });
  });

  describe('isAllowedPdfFile', () => {
    it.each([
      { description: 'wrong mime type and extension', fileName: 'image.png', mimeType: 'image/png', expected: false },
      { description: 'correct mime type, mismatched extension', fileName: 'image.png', mimeType: 'application/pdf', expected: true },
      { description: 'correct extension, missing mime type', fileName: 'd.pdf', mimeType: '', expected: true },
    ])('should return $expected when file has $description', ({ fileName, mimeType, expected }) => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));
      const file = createMockFile(fileName, mimeType);

      const isAllowedPdfFile = result.current.isAllowedPdfFile(file);

      expect(isAllowedPdfFile).toBe(expected);
    });
  });

  describe('handleApplyPdf', () => {
    it.each([
      { uploadResult: undefined },
      { uploadResult: null },
    ])('should not update currentPdfFile when uploadResult is $uploadResult', ({ uploadResult }) => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.handleApplyPdf({ uploadResult });
      });

      expect(result.current.currentPdfFile).toBe(INITIAL_PDF_ENTRY);
    });

    it('should set currentPdfFile.fileName to the given filename when uploadResult includes one', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));
      const newFileName = 'newFileName';
      act(() => {
        result.current.handleApplyPdf({ uploadResult: { filename: newFileName } });
      });

      expect(result.current.currentPdfFile.fileName).toStrictEqual(newFileName);
    });
    it('should set currentPdfFile.fileName to null when uploadResult has no filename', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));
      act(() => {
        result.current.handleApplyPdf({ uploadResult: {} });
      });

      expect(result.current.currentPdfFile.fileName).toBeNull();
    });
  });

  describe('handleDeletePdf', () => {
    it('should reset currentPdfFile to INITIAL_PDF_ENTRY', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.handleDeletePdf();
      });

      expect(result.current.currentPdfFile).toStrictEqual(INITIAL_PDF_ENTRY);
    });
  });

  describe('clearInputs', () => {
    it('should reset all input state values to their defaults', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.setDescriptionNumber('10');
        result.current.setCaseNumber('123');
        result.current.setCaseName('Case Title');
        result.current.setDetailedCaseDescription('Some detailed description');
      });

      expect(result.current.descriptionNumber).toBe('10');
      expect(result.current.caseNumber).toBe('123');
      expect(result.current.caseName).toBe('Case Title');
      expect(result.current.detailedCaseDescription).toBe('Some detailed description');

      act(() => {
        result.current.clearInputs();
      });

      expect(result.current.descriptionNumber).toBe('');
      expect(result.current.caseNumber).toBe('');
      expect(result.current.caseName).toBe('');
      expect(result.current.detailedCaseDescription).toBe('');
    });
  });

  describe('handleSave', () => {
    it('should set fieldErrors and return early if validation fails', async () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.fieldErrors).toHaveProperty('descriptionNumber');
      expect(result.current.fieldErrors).toHaveProperty('caseNumber');
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });

    it('should clear inputs and call setIsOpen with false on success', async () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.setDescriptionNumber('10');
        result.current.setCaseNumber('123');
        result.current.setCaseName('Case Title');
        result.current.setSheetsNumber('5');
        result.current.setCaseDate('2026-07-24');
        result.current.setCaseDescriptions('Descriptions');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.caseNumber).toBe('');
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('should catch generic error from onSave and call toast.error', async () => {
      const onSaveMock = jest.fn().mockRejectedValue(new Error('Some generic error'));
      const { result } = renderHook(() => useArchiveCaseModal({ ...defaultProps, onSave: onSaveMock }));

      act(() => {
        result.current.setDescriptionNumber('10');
        result.current.setCaseNumber('123');
        result.current.setCaseName('Case Title');
        result.current.setSheetsNumber('5');
        result.current.setCaseDate('2026-07-24');
        result.current.setCaseDescriptions('Descriptions');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(toast.error).toHaveBeenCalledWith('Some generic error');
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });

    it('should set duplicate fieldErrors if onSave throws DUPLICATE_CASE_NUMBERS error', async () => {
      const onSaveMock = jest.fn().mockRejectedValue(new Error('DUPLICATE_CASE_NUMBERS'));
      const { result } = renderHook(() => useArchiveCaseModal({ ...defaultProps, onSave: onSaveMock }));

      act(() => {
        result.current.setDescriptionNumber('10');
        result.current.setCaseNumber('123');
        result.current.setCaseName('Case Title');
        result.current.setSheetsNumber('5');
        result.current.setCaseDate('2026-07-24');
        result.current.setCaseDescriptions('Descriptions');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.fieldErrors.descriptionNumber).toBe(CASE_VALIDATION_MESSAGES.duplicateNumbers);
      expect(result.current.fieldErrors.caseNumber).toBe(CASE_VALIDATION_MESSAGES.duplicateNumbers);
      expect(toast.error).toHaveBeenCalledWith('DUPLICATE_CASE_NUMBERS');
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });

    it('should set duplicate fieldErrors if onSave throws error containing "таким номером"', async () => {
      const onSaveMock = jest.fn().mockRejectedValue('Справа з таким номером вже існує');
      const { result } = renderHook(() => useArchiveCaseModal({ ...defaultProps, onSave: onSaveMock }));

      act(() => {
        result.current.setDescriptionNumber('10');
        result.current.setCaseNumber('123');
        result.current.setCaseName('Case Title');
        result.current.setSheetsNumber('5');
        result.current.setCaseDate('2026-07-24');
        result.current.setCaseDescriptions('Descriptions');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.fieldErrors.descriptionNumber).toBe(CASE_VALIDATION_MESSAGES.duplicateNumbers);
      expect(result.current.fieldErrors.caseNumber).toBe(CASE_VALIDATION_MESSAGES.duplicateNumbers);
      expect(toast.error).toHaveBeenCalledWith('Справа з таким номером вже існує');
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });
  });

  describe('handleCancel', () => {
    it('should clear inputs and call setIsOpen with false', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.setCaseNumber('123');
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.caseNumber).toBe('');
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('disabled actions', () => {
    it('should return isSubmitDisabled true if at least one required field is empty', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.setCaseNumber('123');
      });

      expect(result.current.isSubmitDisabled).toBe(true);
    });

    it('should return isSubmitDisabled false if all required fields have values', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.setDescriptionNumber('10');
        result.current.setCaseNumber('123');
        result.current.setCaseName('Case Title');
        result.current.setSheetsNumber('5');
        result.current.setCaseDate('2026-07-24');
        result.current.setCaseDescriptions('Descriptions');
      });

      expect(result.current.isSubmitDisabled).toBe(false);
    });

    it('should return isCancelButtonDisabled true if no field has a value', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      expect(result.current.isCancelDisabled).toBe(true);
    });

    it('should return isCancelButtonDisabled false if at least one field has a value', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.setCaseNumber('123');
      });

      expect(result.current.isCancelDisabled).toBe(false);
    });
  });
});