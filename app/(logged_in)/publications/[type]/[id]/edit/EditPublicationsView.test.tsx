import { Block } from '@blocknote/core';
import { Box, Button, TextField } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { MouseEvent } from 'react';

import { EditPublicationsView, EditPublicationsViewProps } from './EditPublicationsView';
import { EditorLanguage, MenuActionId } from '~/constants/publications';
import { SerializedContent } from '~/shared/components/content-editor';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })),
  useParams: jest.fn(() => ({}))
}));

type MockContentEditorProps = {
  persistence: { onChange: (val: SerializedContent) => void };
  initialContent?: Block[];
};

jest.mock('~/shared/components/content-editor', () => ({
  ContentEditor: ({ persistence, initialContent }: MockContentEditorProps) => (
    <TextField
      slotProps={{
        htmlInput: { 'data-testid': 'mock-content-editor' }
      }}
      multiline
      defaultValue={initialContent ? 'has-content' : ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        persistence.onChange({
          blocks: [{ type: 'paragraph', content: e.target.value }]
        } as unknown as SerializedContent);
      }}
    />
  ),
  isContentEmpty: (blocks?: unknown[]) => !blocks || blocks.length === 0
}));

type MockTitleDropdownProps = {
  onMenuOpen: (e: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
};

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: ({ onMenuOpen, title }: MockTitleDropdownProps) => (
    <Button data-testid="mock-title-dropdown" onClick={onMenuOpen}>
      {title ?? 'Empty Title'}
    </Button>
  )
}));

type MockHeaderRightActionsProps = {
  onMenuOpen: (e: MouseEvent<HTMLButtonElement>) => void;
  onPublish: () => void;
};

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => {
  return function MockHeaderRightActions({ onMenuOpen, onPublish }: MockHeaderRightActionsProps) {
    return (
      <Box data-testid="mock-header-actions">
        <Button data-testid="mock-publish-quick-btn" onClick={onPublish}>
          Quick Publish
        </Button>
        <Button data-testid="mock-publish-menu-btn" onClick={onMenuOpen}>
          Open Publish Menu
        </Button>
      </Box>
    );
  };
});

jest.mock('~/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onDelete, onClose }: { open: boolean; onDelete: () => void; onClose: () => void }) =>
    open ? (
      <Box data-testid="delete-modal-wrapper">
        <Button data-testid="confirm-delete" onClick={onDelete}>
          confirm delete
        </Button>
        <Button data-testid="close-delete-modal" onClick={onClose}>
          cancel delete
        </Button>
      </Box>
    ) : null
}));

describe('EditPublicationsView Component', () => {
  const mockOnLanguageChange = jest.fn();
  const mockOnEditorChange = jest.fn();
  const mockOnAction = jest.fn();
  const mockOnDeleteConfirm = jest.fn();
  const mockOnSeoClick = jest.fn();
  const mockOnBackClick = jest.fn();

  const defaultProps: EditPublicationsViewProps = {
    type: 'news',
    isLoading: false,
    currentData: { adminTitle: 'Test News Title' },
    editedContent: {
      uk: { content: { blocks: [], version: '1', lastModified: '' } },
      en: { content: { blocks: [], version: '1', lastModified: '' } }
    },
    editorResetKey: 0,
    currentLanguage: 'UA',
    onLanguageChange: mockOnLanguageChange,
    onEditorChange: mockOnEditorChange,
    onAction: mockOnAction,
    onDeleteConfirm: mockOnDeleteConfirm,
    onSeoClick: mockOnSeoClick,
    onBackClick: mockOnBackClick
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the loading state when isLoading is true', () => {
    render(<EditPublicationsView {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('should render the loading state when editedContent is null', () => {
    render(<EditPublicationsView {...defaultProps} editedContent={null} />);
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('should render the layout correctly for news', () => {
    render(<EditPublicationsView {...defaultProps} />);

    expect(screen.getByTestId('mock-title-dropdown')).toHaveTextContent('Test News Title');
    expect(screen.getByTestId('mock-content-editor')).toBeInTheDocument();
    expect(screen.getByText('Чернетка')).toBeInTheDocument();
  });

  it('should pass initialContent to editor when content is valid', () => {
    const propsWithContent: EditPublicationsViewProps = {
      ...defaultProps,
      editedContent: {
        uk: { content: { blocks: [{ id: '1' }] as unknown as Block[], version: '1', lastModified: '' } },
        en: { content: { blocks: [], version: '1', lastModified: '' } }
      }
    };
    render(<EditPublicationsView {...propsWithContent} />);
    expect(screen.getByTestId('mock-content-editor')).toHaveValue('has-content');
  });

  it('should render the layout correctly for media (no editor)', () => {
    render(<EditPublicationsView {...defaultProps} type="media" />);

    expect(screen.getByText('Редагування Ми у ЗМІ')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-content-editor')).not.toBeInTheDocument();
  });

  it('should trigger onEditorChange when the user types in the editor', () => {
    render(<EditPublicationsView {...defaultProps} currentLanguage="EN" />);

    const editor = screen.getByTestId('mock-content-editor');
    fireEvent.change(editor, { target: { value: 'New text' } });

    expect(mockOnEditorChange).toHaveBeenCalledTimes(1);
    expect(mockOnEditorChange).toHaveBeenCalledWith(
      expect.objectContaining({ blocks: [{ type: 'paragraph', content: 'New text' }] }),
      'en'
    );
  });

  it('should trigger onLanguageChange when a new language is selected from the menu', () => {
    render(<EditPublicationsView {...defaultProps} currentLanguage="UA" />);

    fireEvent.click(screen.getByTestId('mock-title-dropdown'));
    fireEvent.click(screen.getByText('Англійська'));

    expect(mockOnLanguageChange).toHaveBeenCalledTimes(1);
    expect(mockOnLanguageChange).toHaveBeenCalledWith('EN' as EditorLanguage);
  });

  it('should trigger onSeoClick when the SEO option is selected from the menu', () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-title-dropdown'));
    fireEvent.click(screen.getByText('SEO налаштування'));

    expect(mockOnSeoClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger onAction when a publish menu item is clicked', () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));
    fireEvent.click(screen.getByText('Опублікувати і вийти'));

    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnAction).toHaveBeenCalledWith(MenuActionId.PUBLICATE_AND_EXIT);
  });

  it('should handle the quick publish button from HeaderRightActions directly', () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-quick-btn'));

    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnAction).toHaveBeenCalledWith(MenuActionId.PUBLISH);
  });

  it('should open delete modal and call onDeleteConfirm when deletion is confirmed', () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));
    fireEvent.click(screen.getByText('Видалити'));

    expect(screen.getByTestId('confirm-delete')).toBeInTheDocument();
    expect(mockOnAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('confirm-delete'));

    expect(mockOnDeleteConfirm).toHaveBeenCalledTimes(1);
  });

  it('should close the delete modal when onClose is triggered', () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));
    fireEvent.click(screen.getByText('Видалити'));

    expect(screen.getByTestId('delete-modal-wrapper')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-delete-modal'));

    expect(screen.queryByTestId('delete-modal-wrapper')).not.toBeInTheDocument();
    expect(mockOnDeleteConfirm).not.toHaveBeenCalled();
  });

  it('should render an empty title in TitleDropdown when currentData or adminTitle is missing', () => {
    const propsWithoutTitle: EditPublicationsViewProps = {
      ...defaultProps,
      currentData: null
    };

    render(<EditPublicationsView {...propsWithoutTitle} />);

    expect(screen.getByTestId('mock-title-dropdown')).toHaveTextContent('');
  });

  it('should trigger onAction when the PUBLISH menu item is clicked', () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));
    fireEvent.click(screen.getByText('Опублікувати'));

    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnAction).toHaveBeenCalledWith(MenuActionId.PUBLISH);
  });

  it('should trigger onAction when the CANCEL_PUBLICATION menu item is clicked', () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));
    fireEvent.click(screen.getByText('Скасувати публікацію'));

    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnAction).toHaveBeenCalledWith(MenuActionId.CANCEL_PUBLICATION);
  });
});
