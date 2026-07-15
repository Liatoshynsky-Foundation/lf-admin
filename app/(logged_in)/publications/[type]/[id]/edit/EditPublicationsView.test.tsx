import { Block } from '@blocknote/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    <textarea
      data-testid="mock-content-editor"
      defaultValue={initialContent ? 'has-content' : ''}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    <button data-testid="mock-title-dropdown" onClick={onMenuOpen}>
      {title ?? 'Empty Title'}
    </button>
  )
}));

type MockHeaderRightActionsProps = {
  onMenuOpen: (e: MouseEvent<HTMLButtonElement>) => void;
  onPublish: () => void;
  onPreview: () => void;
};

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => {
  return function MockHeaderRightActions({ onMenuOpen, onPublish, onPreview }: MockHeaderRightActionsProps) {
    return (
      <div data-testid="mock-header-actions">
        <button data-testid="mock-preview-btn" onClick={onPreview}>
          Preview
        </button>
        <button data-testid="mock-publish-quick-btn" onClick={onPublish}>
          Quick Publish
        </button>
        <button data-testid="mock-publish-menu-btn" onClick={onMenuOpen}>
          Open Publish Menu
        </button>
      </div>
    );
  };
});

jest.mock('~/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onDelete, onClose }: { open: boolean; onDelete: () => void; onClose: () => void; }) =>
    open ? (
      <div data-testid="delete-modal">
        <button data-testid="confirm-delete" onClick={onDelete}>confirm delete</button>
        <button data-testid="close-delete-modal" onClick={onClose}>cancel</button>
      </div>
    ) : null
}));

describe('EditPublicationsView Component', () => {
  const mockOnLanguageChange = jest.fn();
  const mockOnEditorChange = jest.fn();
  const mockOnAction = jest.fn();
  const mockOnDeleteConfirm = jest.fn();
  const mockOnSeoClick = jest.fn();

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
    onBackClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the loading state when isLoading is true', () => {
    render(<EditPublicationsView {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('should render empty string for TitleDropdown title if currentData?.adminTitle is null', () => {
    const propsWithNullTitle = {
      ...defaultProps,
      currentData: { adminTitle: null } 
    };
    render(<EditPublicationsView {...propsWithNullTitle} />);

    const dropdown = screen.getByTestId('mock-title-dropdown');
  
    expect(dropdown).toHaveTextContent('');
  });
  it('should render undefined for media ContentEditor initialContent if isContentValid is not valid', () => {
    const propsWithEmptyBlocks = {
      ...defaultProps,
      editedContent: {
        uk: { content: { blocks: [], version: '1', lastModified: '' } },
        en: { content: { blocks: [], version: '1', lastModified: '' } }
      }
    };
    render(<EditPublicationsView {...propsWithEmptyBlocks} />);

    const editor = screen.getByTestId('mock-content-editor');

    expect(editor).toHaveValue('');
  });

  it('should pass initialContent to ContentEditor if isContentValid is true', () => {
    const mockBlocks = [{ id: '1', type: 'paragraph', content: [], props: {} }] as unknown as Block[];
    const propsWithBlocks = {
      ...defaultProps,
      editedContent: {
        uk: { content: { blocks: mockBlocks, version: '1', lastModified: '' } },
        en: { content: { blocks: [], version: '1', lastModified: '' } }
      }
    };
    render(<EditPublicationsView {...propsWithBlocks} />);

    const editor = screen.getByTestId('mock-content-editor');
    expect(editor).toHaveValue('has-content');
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

  it('should trigger onLanguageChange when a new language is selected from the menu', async () => {
    render(<EditPublicationsView {...defaultProps} currentLanguage="UA" />);

    fireEvent.click(screen.getByTestId('mock-title-dropdown'));
    fireEvent.click(screen.getByText('Англійська'));

    expect(mockOnLanguageChange).toHaveBeenCalledTimes(1);
    expect(mockOnLanguageChange).toHaveBeenCalledWith('EN' as EditorLanguage);
    await waitFor(() => {
      expect(screen.queryByText('Англійська')).not.toBeInTheDocument();
    });
  });

  it('should trigger onSeoClick when the SEO option is selected from the menu', async () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-title-dropdown'));
    fireEvent.click(screen.getByText('SEO налаштування'));

    expect(mockOnSeoClick).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText('SEO налаштування')).not.toBeInTheDocument();
    });
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

  it('should trigger onPreview when a eye icon is clicked', () => {
    const mockOnPreview = jest.fn();
    render(<EditPublicationsView {...defaultProps} onPreview={mockOnPreview} />);

    fireEvent.click(screen.getByTestId('mock-preview-btn'));

    expect(mockOnPreview).toHaveBeenCalledTimes(1);
  });


  it('should open delete modal and call onDeleteConfirm when deletion is confirmed', async () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));
    fireEvent.click(screen.getByText('Видалити'));

    expect(screen.getByTestId('confirm-delete')).toBeInTheDocument();
    expect(mockOnAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('confirm-delete'));

    expect(mockOnDeleteConfirm).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText('Видалити')).not.toBeInTheDocument();
    });
  });


  it('should close the navigation menu when pressing Escape (Line 130)', async () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-title-dropdown'));

    fireEvent.keyDown(screen.getByRole('presentation'), { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Мовні версії')).not.toBeInTheDocument();
    });
  });

  it('should close the publish menu when pressing Escape (Line 179)', async () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('should close delete modal when onClose is triggered (Line 206)', async () => {
    render(<EditPublicationsView {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-publish-menu-btn'));
    fireEvent.click(screen.getByText('Видалити'));

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-delete-modal'));

    await waitFor(() => {
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });
  });
});
