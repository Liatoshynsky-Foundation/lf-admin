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
const mockSetIsSaving = jest.fn();

const defaultStoreState = {
  setLocale: mockSetLocale,
  discardChanges: mockDiscardChanges,
  setPageData: mockSetPageData,
  setIsSaving: mockSetIsSaving,
  isChanged: false,
  invalidFields: {},
};

let mockStoreState = { ...defaultStoreState };

jest.mock('~/store', () => ({
  useStore: jest.fn((selector) =>
    selector(mockStoreState)
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
jest.mock('~/shared/components/language-switcher/LanguageSwitcher', () => {
  const MockLanguageSwitcher = () => <div data-testid="language-switcher" />;
  MockLanguageSwitcher.displayName = 'MockLanguageSwitcher';
  return MockLanguageSwitcher;
});

const pageSlug = 'test-page';
const headerTitle = 'Test Header Title';
const childrenText = 'Test Child Content';

const runSimulation = ({
  slug = pageSlug,
  title = headerTitle,
  childrenText: textVal = childrenText,
  variant,
  validateBeforeSave,
}: {
  slug?: string;
  title?: string;
  childrenText?: string;
  variant?: 'default' | 'simple-layout';
  validateBeforeSave?: () => boolean | 'uk' | 'en';
} = {}) => {
  return render(
    <EditablePageLayout
      pageSlug={slug}
      headerTitle={title}
      variant={variant}
      validateBeforeSave={validateBeforeSave}
    >
      <div data-testid="child-content">{textVal}</div>
    </EditablePageLayout>
  );
};

describe('EditablePageLayout', () => {
  const mockPreview = jest.fn();
  const mockSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockStoreState = { ...defaultStoreState };

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
    it('should render Header and skeletons when page query is loading', () => {
      (useGetPageQuery as jest.Mock).mockReturnValue({
        data: null,
        loading: true,
      });

      runSimulation();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveTextContent(headerTitle);
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
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

    it('should pass isActionsDisabled as true on initial render (when isChanged is false)', () => {
      runSimulation();
      expect(screen.getByTestId('actions-disabled-flag')).toHaveTextContent('true');
    });

    it('should pass isActionsDisabled as false when isChanged is true', () => {
      mockStoreState.isChanged = true;
      runSimulation();
      expect(screen.getByTestId('actions-disabled-flag')).toHaveTextContent('false');
    });

    it('should trigger preview, save, cancel and language change callbacks when header controls are clicked and isChanged is true', () => {
      mockStoreState.isChanged = true;
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

  describe('Save disabled on invalid titles', () => {
    it('should pass isSaveDisabled as false when there are no invalid fields', () => {
      runSimulation();
      expect(screen.getByTestId('save-disabled-flag')).toHaveTextContent('false');
    });

    it('should pass isSaveDisabled as true when at least one field is invalid', () => {
      mockStoreState.invalidFields = { 'privacy-policy:Cookies:title': true };
      runSimulation();
      expect(screen.getByTestId('save-disabled-flag')).toHaveTextContent('true');
    });
  });

  describe('Saving state sync', () => {
    it('should push isSaving=true into the store when a save is in progress', () => {
      (useSavePageBlocks as jest.Mock).mockReturnValue({
        save: mockSave,
        loading: true,
      });

      runSimulation();

      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
    });

    it('should push isSaving=true into the store when the editor/preview is loading', () => {
      (usePageEditor as jest.Mock).mockReturnValue({
        preview: mockPreview,
        loading: true,
      });

      runSimulation();

      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
    });

    it('should push isSaving=false into the store when neither is loading', () => {
      runSimulation();

      expect(mockSetIsSaving).toHaveBeenCalledWith(false);
    });
  });

  describe('validateBeforeSave logic', () => {
    it('should not call save if validateBeforeSave returns false', () => {
      mockStoreState.isChanged = true;
      const validateBeforeSave = jest.fn(() => false);
      runSimulation({ validateBeforeSave });

      fireEvent.click(screen.getByTestId('save-btn'));

      expect(validateBeforeSave).toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should call setLocale and not call save if validateBeforeSave returns a string', () => {
      mockStoreState.isChanged = true;
      const validateBeforeSave = jest.fn(() => 'en' as const);
      runSimulation({ validateBeforeSave });

      fireEvent.click(screen.getByTestId('save-btn'));

      expect(validateBeforeSave).toHaveBeenCalled();
      expect(mockSetLocale).toHaveBeenCalledWith('en');
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should call save if validateBeforeSave returns true', () => {
      mockStoreState.isChanged = true;
      const validateBeforeSave = jest.fn(() => true);
      runSimulation({ validateBeforeSave });

      fireEvent.click(screen.getByTestId('save-btn'));

      expect(validateBeforeSave).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('simple-layout variant', () => {
    it('should render correctly with simple-layout', () => {
      runSimulation({ variant: 'simple-layout' });

      expect(screen.getByRole('heading', { name: headerTitle })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Зберегти' })).toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should call handleSave when save button is clicked in simple-layout', () => {
      mockStoreState.isChanged = true;
      runSimulation({ variant: 'simple-layout' });

      fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

      expect(mockSave).toHaveBeenCalled();
    });

    it('should disable save button when loading or not changed', () => {
      mockStoreState.isChanged = false;
      const { rerender } = render(
        <EditablePageLayout pageSlug={pageSlug} headerTitle={headerTitle} variant="simple-layout">
          <div data-testid="child-content">{childrenText}</div>
        </EditablePageLayout>
      );
      expect(screen.getByRole('button', { name: 'Зберегти' })).toBeDisabled();

      mockStoreState.isChanged = true;
      (useSavePageBlocks as jest.Mock).mockReturnValue({ save: mockSave, loading: true });
      rerender(
        <EditablePageLayout pageSlug={pageSlug} headerTitle={headerTitle} variant="simple-layout">
          <div data-testid="child-content">{childrenText}</div>
        </EditablePageLayout>
      );
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render loading skeleton content when query is loading in simple-layout', () => {
      (useGetPageQuery as jest.Mock).mockReturnValue({ data: null, loading: true });
      runSimulation({ variant: 'simple-layout' });

      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });
});
