import { Box, Button } from '@mui/material';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { notFound, useParams, useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';

import { EditPublicationsViewProps } from './EditPublicationsView';
import EditPublicationsPage from './page';
import { CONTENT_MUTATION_RESULTS, LocalizedEditorState, MenuActionId } from '~/constants/publications';
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

const baseMockManager = {
  isLoading: false,
  currentData: { status: BaseContentStatuses.Draft, adminTitle: 'Test Data' },
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
    <Box data-testid="mock-edit-view">
      <Button
        data-testid="trigger-editor-change"
        onClick={() =>
          props.onEditorChange(
            { blocks: [{ type: 'paragraph', content: 'new' }] } as unknown as SerializedContent,
            'uk'
          )
        }
      />
      <Button data-testid="trigger-publish" onClick={() => props.onAction(MenuActionId.PUBLISH)} />
      <Button data-testid="trigger-save-exit" onClick={() => props.onAction(MenuActionId.PUBLICATE_AND_EXIT)} />
      <Button data-testid="trigger-delete" onClick={props.onDeleteConfirm} />
      <Button data-testid="trigger-seo" onClick={props.onSeoClick} />
      <Button
        data-testid="trigger-cancel-publication"
        onClick={() => props.onAction(MenuActionId.CANCEL_PUBLICATION)}
      />
    </Box>
  )
}));

jest.mock('../../create/CreatePublicationsView', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-create-view" />
}));

describe('EditPublicationsPage Container', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ type: 'news', id: '123' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePublicationManager as jest.Mock).mockReturnValue(baseMockManager);
    (useUpsertPublication as jest.Mock).mockReturnValue({ mockUpsertData: true });
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

  it('should debounce editor changes and update state after 500ms', () => {
    jest.useFakeTimers();
    render(<EditPublicationsPage />);

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

    jest.useRealTimers();
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

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-publish'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Помилка: ${errorMessage}`);
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should handle CANCEL_PUBLICATION action, show toast success and redirect', async () => {
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

  it('should clear previous timeout when editor changes multiple times (clearTimeout coverage)', () => {
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    render(<EditPublicationsPage />);

    const trigger = screen.getByTestId('trigger-editor-change');

    fireEvent.click(trigger);
    expect(clearTimeoutSpy).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    clearTimeoutSpy.mockRestore();
    jest.useRealTimers();
  });

  it('should return null in setEditedContent updater if prev state is null', () => {
    jest.useFakeTimers();
    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-editor-change'));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    const stateUpdater = baseMockManager.setEditedContent.mock.calls[0][0] as (
      prev: LocalizedEditorState | null
    ) => LocalizedEditorState | null;

    const newState = stateUpdater(null);

    expect(newState).toBeNull();

    jest.useRealTimers();
  });

  it('should catch non-Error exceptions and format them using String(err)', async () => {
    const rawErrorMessage = 'Fatal Database String Error';

    (usePublicationManager as jest.Mock).mockReturnValue({
      ...baseMockManager,
      updateResource: jest.fn().mockRejectedValue(rawErrorMessage)
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<EditPublicationsPage />);

    fireEvent.click(screen.getByTestId('trigger-publish'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Помилка: ${rawErrorMessage}`);
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
