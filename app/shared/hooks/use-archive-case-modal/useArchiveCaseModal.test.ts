import { act, renderHook } from '@testing-library/react';

import { useArchiveCaseModal, type UseArchiveCaseModalProps } from './useArchiveCaseModal';
import { INITIAL_PDF_ENTRY } from '~/constants/archive';
import { AssetType } from '~/types/graphql/generated/graphql';

const useAllAssetsMock = jest.fn();

jest.mock('../use-assets/useAssets', () => ({
  useAllAssets: () => useAllAssetsMock()
}));

const createMockFile = (name: string, type: string): File => {
  return new File(['dummy content'], name, { type });
};
const mockAssets = [
  { type: AssetType.Pdf, filename: 'sheet_music.pdf' },
];
const mockSetIsOpen = jest.fn();
const defaultProps: UseArchiveCaseModalProps = {
  setIsOpen: mockSetIsOpen,
};

describe('useArchiveCaseModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAllAssetsMock.mockReturnValue({ data: { mockAssets }, loading: false });
  });

  describe('initial state', () => {
    it('should initialize all state values with their defaults', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      expect(result.current).toEqual(
        expect.objectContaining({
          descriptionNumber: '',
          setDescriptionNumber: expect.any(Function),
          caseNumber: '',
          setCaseNumber: expect.any(Function),
          sheetsNumber: '',
          setSheetsNumber: expect.any(Function),
          caseDate: '',
          setCaseDate: expect.any(Function),
          currentPdfFile: INITIAL_PDF_ENTRY,
          setCurrentPdfFile: expect.any(Function),
          detailedCaseDescription: '',
          setDetailedCaseDescription: expect.any(Function),
          caseName: '',
          setCaseName: expect.any(Function),
          caseDescriptions: '',
          setCaseDescriptions: expect.any(Function),
          isUploadModalOpen: false,
          setIsUploadModalOpen: expect.any(Function),
          handleOpenUploadFlow: expect.any(Function),
          handleCloseUploadFlow: expect.any(Function),
          isAllowedPdfFile: expect.any(Function),
          handleApplyPdf: expect.any(Function),
          handleDeletePdf: expect.any(Function),
          handleSubmit: expect.any(Function),
          handleSave: expect.any(Function),
          handleCancel: expect.any(Function),
          clearInputs: expect.any(Function),
          handleSelectPdfSuggestion: expect.any(Function),
        })
      );
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

  describe('handleSelectPdfSuggestion', () => {
    it.each([
      { input: 'newNameEntry', expected: 'newNameEntry' },
      { input: null, expected: null },
    ])('should set currentPdfFile.name to $expected when called with $input', ({ input, expected }) => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.handleSelectPdfSuggestion(input);
      });

      expect(result.current.currentPdfFile.name).toStrictEqual(expected);
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
    it('should clear inputs and call setIsOpen with false', () => {
      const { result } = renderHook(() => useArchiveCaseModal(defaultProps));

      act(() => {
        result.current.setCaseNumber('123');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.caseNumber).toBe('');
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
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
});