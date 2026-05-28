import { Block } from '@blocknote/core';
import { fireEvent,render, screen } from '@testing-library/react';
import React, { MouseEvent } from 'react';

import { EditPublicationsView, EditPublicationsViewProps } from './EditPublicationsView';
import { EditorLanguage, MenuActionId } from '~/constants/publications';
import { SerializedContent } from '~/shared/components/content-editor';


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
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
  isContentEmpty: (blocks?: unknown[]) => !blocks || blocks.length === 0,
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
  ),
}));

type MockHeaderRightActionsProps = {
  onMenuOpen: (e: MouseEvent<HTMLButtonElement>) => void;
  onPublish: () => void;
};

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => {
  return function MockHeaderRightActions({ onMenuOpen, onPublish }: MockHeaderRightActionsProps) {
    return (
      <div data-testid="mock-header-actions">
        <button data-testid="mock-publish-quick-btn" onClick={onPublish}>Quick Publish</button>
        <button data-testid="mock-publish-menu-btn" onClick={onMenuOpen}>Open Publish Menu</button>
      </div>
    );
  };
});

describe('EditPublicationsView Component', () => {
  const mockOnLanguageChange = jest.fn();
  const mockOnEditorChange = jest.fn();
  const mockOnAction = jest.fn();
  const mockOnSeoClick = jest.fn();

  const defaultProps: EditPublicationsViewProps = {
    type: 'news',
    isLoading: false,
    currentData: { adminTitle: 'Test News Title' },
    editedContent: {
      uk: { content: { blocks: [], version: '1', lastModified: '' } },
      en: { content: { blocks: [], version: '1', lastModified: '' } },
    },
    editorResetKey: 0,
    currentLanguage: 'UA',
    onLanguageChange: mockOnLanguageChange,
    onEditorChange: mockOnEditorChange,
    onAction: mockOnAction,
    onSeoClick: mockOnSeoClick,
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
});
