import { act, renderHook } from '@testing-library/react';

import { useArchiveCaseModal } from './useArchiveCaseModal';
import { INITIAL_DETAILED_CASE_DESCRIPTION, INITIAL_PDF_ENTRY } from '~/constants/archive';

const createMockFile = (name: string, type: string): File => {
  return new File(['dummy content'], name, { type });
};

describe('useArchiveCaseModal', () => {
  describe('initial state', () => {
    it('should initialize all state values with their defaults', () => {
      const { result } = renderHook(() => useArchiveCaseModal());

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
          detailedCaseDescription: INITIAL_DETAILED_CASE_DESCRIPTION,
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
          handleSelectPdfSuggestion: expect.any(Function),
        })
      );
    });
  });

  describe('handleOpenUploadFlow', () => {
    it('should set isUploadModalOpen to true', () => {
      const { result } = renderHook(() => useArchiveCaseModal());

      act(() => {
        result.current.handleOpenUploadFlow();
      });

      expect(result.current.isUploadModalOpen).toBe(true);
    });
  });

  describe('handleCloseUploadFlow', () => {
    it('should set isUploadModalOpen to false', () => {
      const { result } = renderHook(() => useArchiveCaseModal());

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
      const { result } = renderHook(() => useArchiveCaseModal());
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
      const { result } = renderHook(() => useArchiveCaseModal());

      act(() => {
        result.current.handleApplyPdf({ uploadResult });
      });

      expect(result.current.currentPdfFile).toBe(INITIAL_PDF_ENTRY);
    });

    it('should set currentPdfFile.fileName to the given filename when uploadResult includes one', () => {
      const { result } = renderHook(() => useArchiveCaseModal());
      const newFileName = 'newFileName';
      act(() => {
        result.current.handleApplyPdf({ uploadResult: { filename: newFileName } });
      });

      expect(result.current.currentPdfFile.fileName).toStrictEqual(newFileName);
    });
    it('should set currentPdfFile.fileName to null when uploadResult has no filename', () => {
      const { result } = renderHook(() => useArchiveCaseModal());
      act(() => {
        result.current.handleApplyPdf({ uploadResult: {} });
      });

      expect(result.current.currentPdfFile.fileName).toBeNull();
    });
  });

  describe('handleDeletePdf', () => {
    it('should reset currentPdfFile to INITIAL_PDF_ENTRY', () => {
      const { result } = renderHook(() => useArchiveCaseModal());

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
      const { result } = renderHook(() => useArchiveCaseModal());

      act(() => {
        result.current.handleSelectPdfSuggestion(input);
      });

      expect(result.current.currentPdfFile.name).toStrictEqual(expected);
    });
  });
});