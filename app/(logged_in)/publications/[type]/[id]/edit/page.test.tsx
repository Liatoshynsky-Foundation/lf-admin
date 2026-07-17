import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { notFound, useParams, useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';

import { EditPublicationsViewProps } from './EditPublicationsView';
import EditPublicationsPage from './page';
import { CONTENT_MUTATION_RESULTS, LocalizedEditorState, MenuActionId } from '~/constants/publications';
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
  currentLanguage: 'UA',
  setCurrentLanguage: jest.fn(),
  editorResetKey: 0,
  resetEditorState: jest.fn(),
  updateResource: jest.fn().mockResolvedValue({ data: { id: '1' } }),
  deleteResource: jest.fn().mockResolvedValue({ data: { id: '1' } })
};

jest.mock('./EditPublicationsView', () => ({
  EditPublicationsView: (props: EditPublicationsViewProps) => (
    <div data-testid="mock-edit-view">
      <button
        data-testid="trigger-editor-change"
        onClick={() =>
          props.onEditorChange(
            { blocks: [{ type: 'paragraph', content: 'new' }] } as unknown as SerializedContent,
            'uk'
          )
        }
      />
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

const mockHandleSave = jest.fn().mockResolvedValue(undefined);

describe('EditPublicationsPage Container', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy.mockClear();


    (useParams as jest.Mock).mockReturnValue({ type: 'news', id: '123' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePublicationManager as jest.Mock).mockReturnValue(baseMockManager);
    (useUpsertPublication as jest.Mock).mockReturnValue({
      mockUpsertData: true, handleSave: mockHandleSave
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
    (fetchPreview as jest.Mock).mockResolvedValue(null);
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));


    await waitFor(() => {
      expect(fetchPreview).toHaveBeenCalledTimes(1);
    });
    expect(fetchPreview).toHaveBeenCalledWith({ slug: `news/${dbSlug}`, lang: 'uk', draftId: '123' });

  });

  it('should not redirect to preview page when onPreview is triggered if no slug from manager', async () => {
    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      currentData: {
        status: 'draft',
        adminTitle: 'fdfsdfsd',
      }
    });

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Виникла помилка при отриманні даних для попереднього перегляду');
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Не вдалося завантажити slug для попереднього перегляду'));
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

  it('should debounce editor changes and update state after 500ms', () => {
    jest.useFakeTimers();
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-editor-change'));
    fireEvent.click(screen.getByTestId('trigger-editor-change'));

    expect(baseMockManager.setEditedContent).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(baseMockManager.setEditedContent).toHaveBeenCalledTimes(1);

    const stateUpdater = baseMockManager.setEditedContent.mock.calls[0][0] as (
      prev: LocalizedEditorState | null
    ) => LocalizedEditorState | null;
    const prevState = baseMockManager.editedContent;
    const newState = stateUpdater(prevState);

    expect(newState?.uk?.content.blocks[0].content).toBe('new');

    const nullState = stateUpdater(null);
    expect(nullState).toBeNull();

    jest.useRealTimers();
  });


  it('should handle PUBLISH action correctly', async () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-publish'));

    await waitFor(() => {
      expect(baseMockManager.updateResource).toHaveBeenCalledWith(BaseContentStatuses.Published, {
        content: baseMockManager.editedContent
      });
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.draftPublished);
    });
  });

  it('should handle PUBLICATE_AND_EXIT action and redirect router', async () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-save-exit'));

    await waitFor(() => {
      expect(baseMockManager.updateResource).toHaveBeenCalledWith(BaseContentStatuses.Draft, {
        content: baseMockManager.editedContent
      });
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.draftSaved);
      expect(mockPush).toHaveBeenCalledWith('/publications');
    });
  });

  it('should handle delete confirmation by deleting the publication and redirecting', async () => {
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-delete'));

    await waitFor(() => {
      expect(baseMockManager.deleteResource).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationDeleted);
      expect(mockPush).toHaveBeenCalledWith('/publications');
    });
  });

  it('should catch mutation errors and trigger a toast.error', async () => {
    const errorMessage = 'Network Failure';
    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      updateResource: jest.fn().mockRejectedValue(new Error(errorMessage))
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-publish'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Помилка: ${errorMessage}`);
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
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
    expect(fetchPreview).toHaveBeenCalledWith({ slug: `news/${dbSlug}`, lang: 'en', draftId: '123' });
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

  it('should show an error toast when onPreview is triggered and handleSave throws a non-Error string', async () => {
    (useUpsertPublication as jest.Mock).mockReturnValue({
      mockUpsertData: true,
      handleSave: jest.fn().mockRejectedValue('String Error')
    });
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-preview'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Помилка: String Error');
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