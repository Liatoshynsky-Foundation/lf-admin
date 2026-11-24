import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { notFound, useParams, useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';

import { EditPublicationsViewProps } from './EditPublicationsView';
import EditPublicationsPage from './page';
import { CONTENT_MUTATION_RESULTS, LocalizedEditorState, MENU_ACTION_CONFIGS, MenuActionId } from '~/constants/publications';
import { fetchPreview } from '~/lib/utils/fetchPreview';
import { SerializedContent } from '~/shared/components/content-editor';
import { usePublicationManager } from '~/shared/hooks/use-publications-manager/usePublicationsManager';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  notFound: jest.fn(),
  usePathname: jest.fn(() => '/publications/news/123/edit')
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/shared/hooks/use-publications-manager/usePublicationsManager', () => ({
  usePublicationManager: jest.fn()
}));

jest.mock('~/shared/hooks/use-upsert-publication/useUpsertPublication', () => ({
  useUpsertPublication: jest.fn()
}));

jest.mock('~/lib/utils/fetchPreview', () => ({
  fetchPreview: jest.fn()
}));

const dbSlug = 'slug-from-db';
const baseMockManager = {
  isLoading: false,
  currentData: { status: BaseContentStatuses.Draft, adminTitle: 'Test Data', slug: dbSlug },
  hasError: false,
  editedContent: {
    uk: { content: { blocks: [], version: '1', lastModified: '' } },
    en: { content: { blocks: [], version: '1', lastModified: '' } }
  },
  setEditedContent: jest.fn(),
  markContentSaved: jest.fn(),
  currentLanguage: 'UA',
  setCurrentLanguage: jest.fn(),
  editorResetKey: 0,
  resetEditorState: jest.fn(),
  updateResource: jest.fn(),
  updatePreviewResource: jest.fn(),
  deleteResource: jest.fn()
};

jest.mock('./EditPublicationsView', () => ({
  EditPublicationsView: (props: EditPublicationsViewProps) => (
    <div data-testid="mock-edit-view">
      {(['uk', 'en'] as const).map((locale) => (
        <button
          key={locale}
          data-testid={`edit-${locale}`}
          onClick={() =>
            props.onEditorChange(
              { blocks: [{ type: 'paragraph', content: `Updated ${locale}` }] } as unknown as SerializedContent,
              locale
            )
          }
        />
      ))}
      <button data-testid="trigger-save" onClick={props.onSave} disabled={props.isSaving} />
      <button data-testid="trigger-publish" onClick={() => props.onAction(MenuActionId.PUBLISH)} />
      <button data-testid="trigger-save-exit" onClick={() => props.onAction(MenuActionId.PUBLICATE_AND_EXIT)} />
      <button data-testid="trigger-delete" onClick={props.onDeleteConfirm} />
      <button data-testid="trigger-seo" onClick={props.onSeoClick} />
      <button data-testid="trigger-preview" onClick={props.onPreview} />
      <button data-testid="trigger-cancel-publication" onClick={() => props.onAction(MenuActionId.CANCEL_PUBLICATION)} />
    </div>
  )
}));

const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

jest.mock('../../create/CreatePublicationsView', () => ({
  __esModule: true,
  default: ({ onPreview }: { onPreview?: () => void }) => (
    <div data-testid="mock-create-view">
      {onPreview && <button data-testid="trigger-media-preview" onClick={onPreview} />}
    </div>
  )
}));

const handleSaveSlug = 'slug';
const mockHandleSave = jest.fn().mockResolvedValue({ id: 11, slug: handleSaveSlug });
const mockHandlePreviewSave = jest.fn().mockResolvedValue({ id: 11, slug: handleSaveSlug });

describe('EditPublicationsPage Container', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy.mockClear();

    baseMockManager.updateResource.mockResolvedValue({ data: { id: '1' } });
    baseMockManager.updatePreviewResource.mockResolvedValue({ data: { id: '1' } });
    baseMockManager.deleteResource.mockResolvedValue({ data: { id: '1' } });
    (useParams as jest.Mock).mockReturnValue({ type: 'news', id: '123' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePublicationManager as jest.Mock).mockReturnValue(baseMockManager);
    (useUpsertPublication as jest.Mock).mockReturnValue({
      mockUpsertData: true,
      handleSave: mockHandleSave,
      handlePreviewSave: mockHandlePreviewSave
    });
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  it('should render CreatePublicationsView if type is media', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'media', id: '456' });

    render(<EditPublicationsPage />);

    expect(useUpsertPublication).toHaveBeenCalledWith({ type: 'media', id: '456' });
    expect(screen.getByTestId('mock-create-view')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-edit-view')).not.toBeInTheDocument();
  });

  it('should call notFound if loading is finished but data is null', () => {
    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      isLoading: false,
      currentData: null,
      hasError: false
    });

    render(<EditPublicationsPage />);
    expect(notFound).toHaveBeenCalled();
  });

  it('should redirect to SEO page when onSeoClick is triggered', () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-seo'));

    expect(mockPush).toHaveBeenCalledWith('/publications/news/123/seo');
  });

  it('should handle CANCEL_PUBLICATION action and redirect router', async () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-cancel-publication'));

    await waitFor(() => {
      expect(baseMockManager.updateResource).toHaveBeenCalledWith(BaseContentStatuses.Draft, {
        content: baseMockManager.editedContent
      });
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
      expect(mockPush).toHaveBeenCalledWith('/publications');
    });
  });

  it('should redirect to UK preview page when onPreview is triggered', async () => {
    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      currentData: { ...baseMockManager.currentData, status: BaseContentStatuses.Published }
    });
    (fetchPreview as jest.Mock).mockResolvedValue(null);

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));

    await waitFor(() => {
      expect(fetchPreview).toHaveBeenCalledTimes(1);
    });
    expect(mockHandlePreviewSave).toHaveBeenCalled();
    expect(baseMockManager.updatePreviewResource).toHaveBeenCalledWith(
      11,
      BaseContentStatuses.Draft,
      { content: baseMockManager.editedContent }
    );
    expect(fetchPreview).toHaveBeenCalledWith({ slug: `news/${handleSaveSlug}`, lang: 'uk', draftId: 11 });
  });

  it('should not redirect to preview page when onPreview is triggered if no slug from manager for media', async () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'media', id: '123' });
    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      currentData: {
        status: 'draft',
        adminTitle: 'fdfsdfsd',
      }
    });

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-media-preview'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Виникла помилка при отриманні даних для попереднього перегляду');
    });

    expect(fetchPreview).not.toHaveBeenCalled();
  });

  it('should show an error toast if on redirect to preview page when onPreview is triggered fetchPreview rejects', async () => {
    (fetchPreview as jest.Mock).mockRejectedValue(new Error('New Error'));
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Помилка: New Error');
    });
    expect(fetchPreview).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['news', BaseContentStatuses.Published],
    ['news', BaseContentStatuses.Hidden],
    ['events', BaseContentStatuses.Published],
    ['events', BaseContentStatuses.Hidden]
  ])('saves both locales immediately for %s with status %s', async (type, status) => {
    (useParams as jest.Mock).mockReturnValue({ type, id: '123' });
    (usePublicationManager as jest.Mock).mockImplementation(function useMockPublicationManager() {
      const [editedContent, setEditedContent] = React.useState<LocalizedEditorState>(baseMockManager.editedContent);
      return { ...baseMockManager, editedContent, setEditedContent, currentData: { ...baseMockManager.currentData, status } };
    });

    render(<EditPublicationsPage />);
    fireEvent.click(screen.getByTestId('edit-uk'));
    fireEvent.click(screen.getByTestId('edit-en'));
    fireEvent.click(screen.getByTestId('trigger-save'));

    const content = {
      uk: { content: { blocks: [{ type: 'paragraph', content: 'Updated uk' }] } },
      en: { content: { blocks: [{ type: 'paragraph', content: 'Updated en' }] } }
    };
    expect(baseMockManager.updateResource).toHaveBeenCalledTimes(1);
    expect(baseMockManager.updateResource).toHaveBeenCalledWith(undefined, { content });
    expect(baseMockManager.updatePreviewResource).not.toHaveBeenCalled();
    expect(mockHandlePreviewSave).not.toHaveBeenCalled();

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Зміни збережено.'));
    expect(baseMockManager.markContentSaved).toHaveBeenCalledWith(content);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('disables Save during the request and marks the submitted content as saved', async () => {
    let resolveSave!: (value: { data: { id: string } }) => void;
    baseMockManager.updateResource.mockReturnValueOnce(new Promise((resolve) => { resolveSave = resolve; }));

    render(<EditPublicationsPage />);
    const saveButton = screen.getByTestId('trigger-save');
    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
    fireEvent.click(saveButton);
    expect(baseMockManager.updateResource).toHaveBeenCalledTimes(1);
    expect(baseMockManager.markContentSaved).not.toHaveBeenCalled();

    await act(async () => resolveSave({ data: { id: '123' } }));
    expect(baseMockManager.markContentSaved).toHaveBeenCalledWith(baseMockManager.editedContent);
    expect(saveButton).toBeEnabled();
  });

  it('allows navigation after saving the pending edits', async () => {
    (usePublicationManager as jest.Mock).mockImplementation(function useMockPublicationManager() {
      const [editedContent, setEditedContent] = React.useState<LocalizedEditorState>(baseMockManager.editedContent);
      const [savedContent, markContentSaved] = React.useState(editedContent);
      return {
        ...baseMockManager,
        editedContent,
        setEditedContent,
        markContentSaved,
        hasUnsavedChanges: editedContent !== savedContent
      };
    });

    render(<EditPublicationsPage />);
    fireEvent.click(screen.getByTestId('edit-uk'));
    fireEvent.click(screen.getByTestId('trigger-seo'));
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('trigger-save'));
    await waitFor(() => expect(screen.getByTestId('trigger-save')).toBeEnabled());

    fireEvent.click(screen.getByTestId('trigger-seo'));
    expect(mockPush).toHaveBeenCalledWith('/publications/news/123/seo');
  });

  it.each(['empty response', 'rejected request'])('shows an error and allows retry after a %s', async (failure) => {
    if (failure === 'empty response') {
      baseMockManager.updateResource.mockResolvedValueOnce({ data: null });
    } else {
      baseMockManager.updateResource.mockRejectedValueOnce(new Error('Request failed'));
    }

    render(<EditPublicationsPage />);
    const saveButton = screen.getByTestId('trigger-save');
    fireEvent.click(saveButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Не вдалося зберегти зміни. Спробуйте ще раз.'));
    expect(toast.success).not.toHaveBeenCalled();
    expect(baseMockManager.markContentSaved).not.toHaveBeenCalled();
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Зміни збережено.'));
  });

  it('should handle PUBLISH action correctly', async () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-publish'));

    await waitFor(() => {
      expect(baseMockManager.updateResource).toHaveBeenCalledWith(BaseContentStatuses.Published, {
        content: baseMockManager.editedContent
      });
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
    });
  });

  it('should handle PUBLICATE_AND_EXIT action and redirect router', async () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-save-exit'));

    await waitFor(() => {
      expect(baseMockManager.updateResource).toHaveBeenCalledWith(BaseContentStatuses.Published, {
        content: baseMockManager.editedContent
      });
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
      expect(mockPush).toHaveBeenCalledWith('/publications');
    });
  });

  it('should handle DELETE action confirmation by deleting the publication and redirecting', async () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-delete'));

    await waitFor(() => {
      expect(baseMockManager.deleteResource).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationDeleted);
      expect(mockPush).toHaveBeenCalledWith('/publications');
    });
  });

  describe('when manager action handlers return data as null', () => {
    it.each([
      [MenuActionId.PUBLISH, 'trigger-publish', MENU_ACTION_CONFIGS.PUBLISH.toastErrorMessage],
      [MenuActionId.PUBLICATE_AND_EXIT, 'trigger-save-exit', MENU_ACTION_CONFIGS.PUBLICATE_AND_EXIT.toastErrorMessage],
      [MenuActionId.CANCEL_PUBLICATION, 'trigger-cancel-publication', MENU_ACTION_CONFIGS.CANCEL_PUBLICATION.toastErrorMessage]
    ])('should trigger toast.error and not call mockPush when %s returns data null', async (_, triggerId, expectedToast) => {
      baseMockManager.updateResource.mockResolvedValue({ data: null });

      render(<EditPublicationsPage />);
      fireEvent.click(screen.getByTestId(triggerId));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expectedToast);
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it('should trigger toast.error and not call mockPush when DELETE returns data null', async () => {
      baseMockManager.deleteResource.mockResolvedValue({ data: null });

      render(<EditPublicationsPage />);
      fireEvent.click(screen.getByTestId('trigger-delete'));

      await waitFor(() => {
        expect(baseMockManager.deleteResource).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith('Виникла помилка при видаленні публікації. Спробуйте ще раз.');
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  it('should redirect to EN preview page when onPreview is triggered and language is EN', async () => {
    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      currentLanguage: 'EN'
    });
    (fetchPreview as jest.Mock).mockResolvedValue(null);

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));

    await waitFor(() => {
      expect(fetchPreview).toHaveBeenCalledTimes(1);
    });
    expect(fetchPreview).toHaveBeenCalledWith({ slug: `news/${handleSaveSlug}`, lang: 'en', draftId: 11 });
  });

  it('should handle preview for media type', async () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'media', id: '456' });
    (fetchPreview as jest.Mock).mockResolvedValue(null);

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-media-preview'));

    await waitFor(() => {
      expect(fetchPreview).toHaveBeenCalledTimes(1);
    });
    expect(fetchPreview).toHaveBeenCalledWith({ slug: '/news?tab=press', lang: 'uk', draftId: '456' });
  });

  it('should show an error toast when onPreview is triggered and handlePreviewSave throws a non-Error string', async () => {
    (useUpsertPublication as jest.Mock).mockReturnValue({
      mockUpsertData: true,
      handleSave: mockHandleSave,
      handlePreviewSave: jest.fn().mockRejectedValue('String Error')
    });

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Помилка: String Error');
    });
  });

  it.each([
    ['handlePreviewSave returns undefined', undefined],
    ['handlePreviewSave returns id undefined', { slug: 'slug' }],
    ['handlePreviewSave returns slug undefined', { id: 11 }],
  ])('should not trigger fetchPreview when onPreview is triggered and %s', async (_, resolvedValue) => {
    (useUpsertPublication as jest.Mock).mockReturnValue({
      mockUpsertData: true,
      handleSave: mockHandleSave,
      handlePreviewSave: jest.fn().mockResolvedValue(resolvedValue)
    });

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));

    await waitFor(() => {
      expect(fetchPreview).not.toHaveBeenCalled();
    });
  });

  it('should catch non-Error mutation errors and trigger a toast.error', async () => {
    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      updateResource: jest.fn().mockRejectedValue('String Mutation Error')
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-publish'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Помилка: String Mutation Error');
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
