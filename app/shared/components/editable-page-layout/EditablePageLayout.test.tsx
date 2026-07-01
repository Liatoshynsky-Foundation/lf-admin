import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { EditablePageLayout } from './EditablePageLayout';
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useGetPageQuery } from '~/types/graphql/generated/graphql';

const mockSetLocale = jest.fn();
const mockDiscardChanges = jest.fn();
const mockSetPageData = jest.fn();

jest.mock('~/store', () => ({
  useStore: jest.fn((selector) =>
    selector({
      setLocale: mockSetLocale,
      discardChanges: mockDiscardChanges,
      setPageData: mockSetPageData,
    })
  ),
}));

jest.mock('~/shared/hooks/use-page-editor/usePageEditor', () => ({
  usePageEditor: jest.fn(),
}));

jest.mock('~/shared/hooks/use-save-page/UseSavePage', () => ({
  useSavePageBlocks: jest.fn(),
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useGetPageQuery: jest.fn(),
}));

jest.mock('~/shared/components/header/Header');

const pageSlug = 'test-page';
const headerTitle = 'Test Header Title';
const childrenText = 'Test Child Content';

const runSimulation = ({
  slug = pageSlug,
  title = headerTitle,
  childrenText: textVal = childrenText,
}: {
  slug?: string;
  title?: string;
  childrenText?: string;
} = {}) => {
  return render(
    <EditablePageLayout pageSlug={slug} headerTitle={title}>
      <div data-testid="child-content">{textVal}</div>
    </EditablePageLayout>
  );
};

describe('EditablePageLayout', () => {
  const mockPreview = jest.fn();
  const mockSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useGetPageQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
    });

    (usePageEditor as jest.Mock).mockReturnValue({
      preview: mockPreview,
      loading: false,
    });

    (useSavePageBlocks as jest.Mock).mockReturnValue({
      save: mockSave,
      loading: false,
    });
  });

  describe('UI', () => {
    it('should render nothing when page query is loading', () => {
      (useGetPageQuery as jest.Mock).mockReturnValue({
        data: null,
        loading: true,
      });

      const { container } = runSimulation();

      expect(container.firstChild).toBeNull();
    });

    it('should render Header with correct title and children when loaded', () => {
      runSimulation();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveTextContent(headerTitle);
      expect(screen.getByTestId('child-content')).toHaveTextContent(childrenText);
    });
  });

  describe('Query & store Logic', () => {
    it('should call useGetPageQuery with the correct slug', () => {
      runSimulation();

      expect(useGetPageQuery).toHaveBeenCalledWith({
        variables: { slug: pageSlug },
      });
    });

    it('should call setPageData with blocks and blocksOrder when page query finishes loading', () => {
      const mockBlocks = { block1: { id: 'block1', content: {} } };
      const mockBlocksOrder = ['block1'];

      (useGetPageQuery as jest.Mock).mockReturnValue({
        data: {
          pageBlocks: {
            blocks: mockBlocks,
            blocksOrder: mockBlocksOrder,
          },
        },
        loading: false,
      });

      runSimulation();

      expect(mockSetPageData).toHaveBeenCalledWith(
        pageSlug,
        mockBlocks,
        mockBlocksOrder,
        true
      );
    });

    it('should not call setPageData if data has no pageBlocks', () => {
      (useGetPageQuery as jest.Mock).mockReturnValue({
        data: null,
        loading: false,
      });

      runSimulation();

      expect(mockSetPageData).not.toHaveBeenCalled();
    });
  });

  describe('Header logic', () => {
    it('should pass isSaving as true if editorLoading is true', () => {
      (usePageEditor as jest.Mock).mockReturnValue({
        preview: mockPreview,
        loading: true,
      });

      runSimulation();

      expect(screen.getByTestId('saving-flag')).toHaveTextContent('true');
    });

    it('should pass isSaving as true if saveLoading is true', () => {
      (useSavePageBlocks as jest.Mock).mockReturnValue({
        save: mockSave,
        loading: true,
      });

      runSimulation();

      expect(screen.getByTestId('saving-flag')).toHaveTextContent('true');
    });

    it('should pass isSaving as false if both loading are false', () => {
      runSimulation();

      expect(screen.getByTestId('saving-flag')).toHaveTextContent('false');
    });

    it('should trigger preview, save, cancel and language change callbacks when header controls are clicked', () => {
      runSimulation();

      fireEvent.click(screen.getByTestId('preview-btn'));
      expect(mockPreview).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('save-btn'));
      expect(mockSave).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('cancel-btn'));
      expect(mockDiscardChanges).toHaveBeenCalledWith(pageSlug);

      fireEvent.click(screen.getByTestId('lang-en'));
      expect(mockSetLocale).toHaveBeenCalledWith('en');
    });
  });
});
