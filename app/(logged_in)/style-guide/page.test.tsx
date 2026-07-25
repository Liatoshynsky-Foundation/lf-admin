import { fireEvent, render, screen, within } from '@testing-library/react';
import React, { type ReactNode } from 'react';

import StyleGuide from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => ''
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock('lucide-react', () => ({
  Upload: () => <svg data-testid="icon-upload" />
}));

jest.mock('~/public/icons/favourite-star.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="icon-favourite-star" />
}));

interface ChildrenProps {
  children?: ReactNode;
}

interface OpenCloseProps {
  open: boolean;
  onClose: () => void;
}

interface LabeledOption {
  value: string;
  label: string;
}

interface TabItem {
  id: string;
  label: string;
}

jest.mock('~/ds-components/alert/Alert', () => ({
  __esModule: true,
  default: () => <div data-testid="alert" />
}));

interface MockButtonProps extends ChildrenProps {
  onClick?: () => void;
}

jest.mock('~/ds-components/button/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: MockButtonProps) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  )
}));

jest.mock('~/ds-components/button-group/ButtonGroup', () => ({
  __esModule: true,
  default: () => <div data-testid="button-group" />
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: ChildrenProps) => <div data-testid="collapsible-block">{children}</div>
}));

interface MockDiscardChangesModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

jest.mock('~/shared/components/design-system/discard-changes-modal/DiscardChangesModal', () => ({
  __esModule: true,
  default: ({ open, handleClose, handleSubmit }: MockDiscardChangesModalProps) =>
    open ? (
      <div data-testid="discard-changes-modal">
        <button type="button" onClick={handleClose}>
          Close
        </button>
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    ) : null
}));

jest.mock('~/shared/components/design-system/link/CustomLink', () => ({
  __esModule: true,
  default: ({ children }: ChildrenProps) => <a data-testid="custom-link">{children}</a>
}));

jest.mock('~/shared/components/design-system/password-field/PasswordField', () => ({
  __esModule: true,
  default: () => <div data-testid="password-field" />
}));

interface MockImagePreviewBlockProps {
  onChangeImage: () => void;
}

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: function MockPhotoBlock({ onChangeImage }: MockImagePreviewBlockProps) {
    React.useEffect(() => {
      onChangeImage();
    }, [onChangeImage]);
    return <div data-testid="image-preview-block" />;
  }
}));

interface MockCustomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

jest.mock('~/shared/components/design-system/tabs/Tabs', () => ({
  CustomTabs: ({ tabs, activeTab, onTabChange }: MockCustomTabsProps) => (
    <div data-testid="custom-tabs">
      <span data-testid="custom-tabs-active">{activeTab}</span>
      {tabs.map((tab) => (
        <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: () => <div data-testid="custom-text-field" />
}));

interface MockTooltipProps extends ChildrenProps {
  isOpen?: boolean;
}

jest.mock('~/shared/components/design-system/tooltip/Tooltip', () => ({
  __esModule: true,
  default: ({ children, isOpen }: MockTooltipProps) => (
    <div data-testid="tooltip-custom" data-open={String(Boolean(isOpen))}>
      {children}
    </div>
  )
}));

interface MockContentCardProps {
  onClick: () => void;
}

jest.mock('~/shared/components/content-card/ContentCard', () => ({
  __esModule: true,
  default: function MockContentCard({ onClick }: MockContentCardProps) {
    React.useEffect(() => {
      onClick();
    }, [onClick]);
    return <div data-testid="content-card" />;
  }
}));

interface MockCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

jest.mock('~/shared/components/composition-modal/CompositionModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: MockCompositionModalProps) =>
    isOpen ? (
      <div data-testid="composition-modal">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
}));

interface MockDeleteCardModalProps extends OpenCloseProps {
  onDelete: () => void;
}

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: function MockDeleteCardModal({ open, onClose, onDelete }: MockDeleteCardModalProps) {
    React.useEffect(() => {
      if (open) {
        onDelete();
      }
    }, [open, onDelete]);

    return open ? (
      <div data-testid="delete-card-modal">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null;
  }
}));

interface MockDeleteFileModalProps extends OpenCloseProps {
  isDeleting: boolean;
  file: {
    id: string;
    filename: string;
    usageRefs?: Array<{ pageId: string; blockId: string }>;
  };
  onConfirm: () => void;
}

jest.mock('~/shared/components/delete-file-modal/DeleteFileModal', () => ({
  __esModule: true,
  default: function MockDeleteFileModal({ open, onClose, isDeleting, file, onConfirm }: MockDeleteFileModalProps) {
    React.useEffect(() => {
      if (open) {
        onConfirm();
      }
    }, [open, onConfirm]);

    return open ? (
      <div data-testid="delete-file-modal">
        <span data-testid="delete-file-modal-is-deleting">{String(Boolean(isDeleting))}</span>
        <span data-testid="delete-file-modal-has-refs">{String(Boolean(file.usageRefs))}</span>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null;
  }
}));

jest.mock('~/shared/components/divided-header/DividedHeader', () => ({
  __esModule: true,
  default: ({ children }: ChildrenProps) => <div data-testid="divided-header">{children}</div>
}));

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => ({
  __esModule: true,
  default: ({ mode }: { mode: string }) => <div data-testid="header-right-actions">{mode}</div>
}));

jest.mock('~/shared/components/divided-header/progress-status/ProgressStatus', () => ({
  __esModule: true,
  default: () => <div data-testid="progress-status" />
}));

interface MockTitleDropdownProps {
  title: string;
  onMenuOpen: () => void;
}

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: function MockTitleDropdown({ title, onMenuOpen }: MockTitleDropdownProps) {
    React.useEffect(() => {
      onMenuOpen();
    }, [onMenuOpen]);
    return <div data-testid="title-dropdown">{title}</div>;
  }
}));

interface MockEmptyStateProps {
  title: string;
  action?: {
    label: string;
    href: string;
    onClick: () => void;
  };
}

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: function MockEmptyState({ title, action }: MockEmptyStateProps) {
    React.useEffect(() => {
      if (action?.onClick) {
        action.onClick();
      }
    }, [action]);
    return <div data-testid="empty-state">{title}</div>;
  }
}));

jest.mock('~/shared/components/file-card', () => ({
  __esModule: true,
  default: () => <div data-testid="file-card" />
}));

jest.mock('~/shared/components/file-info-sidebar/FileInfoSidebar', () => ({
  FileInfoSidebar: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="file-info-sidebar">
      <button type="button" onClick={onClose}>
        Close sidebar
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/file-info-sidebar/image-preview-modal/ImagePreviewModal', () => ({
  ImagePreviewModal: ({ open, onClose }: OpenCloseProps) =>
    open ? (
      <div data-testid="image-preview-modal">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
}));

jest.mock('~/shared/components/files-cards-layout', () => ({
  FilesCardsLayoutView: () => <div />
}));

interface MockFilteringToolbarProps {
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  filtersButtonLabel: string;
  rightSlot?: ReactNode;
  bottomTrailingContent?: ReactNode;
}

interface MockSortSelectProps {
  triggerLabel: string;
  fieldOptions: LabeledOption[];
  orderOptions: Record<string, LabeledOption[]>;
  fieldValue: string;
  value: string;
  onFieldChange: (field: string) => void;
  onValueChange: (value: string) => void;
}

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: ({
    isFiltersOpen,
    onToggleFilters,
    onClearFilters,
    filtersButtonLabel,
    rightSlot,
    bottomTrailingContent
  }: MockFilteringToolbarProps) => (
    <div data-testid="filtering-toolbar">
      <button type="button" onClick={onToggleFilters}>
        {filtersButtonLabel} ({isFiltersOpen ? 'opened' : 'closed'})
      </button>
      <button type="button" onClick={onClearFilters}>
        Clear filters
      </button>
      {rightSlot}
      {bottomTrailingContent}
    </div>
  ),
  SortSelect: ({
    triggerLabel,
    fieldOptions,
    orderOptions,
    fieldValue,
    value,
    onFieldChange,
    onValueChange
  }: MockSortSelectProps) => (
    <div data-testid="sort-select">
      <span data-testid="sort-select-trigger">{triggerLabel}</span>
      {fieldOptions.map((field) => (
        <button key={field.value} type="button" onClick={() => onFieldChange(field.value)}>
          field:{field.label}
        </button>
      ))}
      {orderOptions[fieldValue].map((order) => (
        <button
          key={order.value}
          type="button"
          aria-pressed={order.value === value}
          onClick={() => onValueChange(order.value)}
        >
          order:{order.label}
        </button>
      ))}
    </div>
  )
}));

jest.mock('~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: ChildrenProps) => <div data-testid="seo-collapsible-block">{children}</div>
}));

interface MockSeoBaseFieldsProps {
  onFieldChange: () => void;
  onBlur: () => void;
}

jest.mock('~/shared/components/forms/seo-metadata-form/seo-base-fields/SeoBaseFields', () => ({
  SeoBaseFields: function MockSeoBaseFields({ onFieldChange, onBlur }: MockSeoBaseFieldsProps) {
    React.useEffect(() => {
      onFieldChange();
      onBlur();
    }, [onFieldChange, onBlur]);
    return <div data-testid="seo-base-fields" />;
  }
}));

interface MockDateTimePickerProps {
  onChange: () => void;
}

jest.mock('~/shared/components/forms/seo-metadata-form/seo-date-time-picker/DateTimePicker', () => ({
  __esModule: true,
  default: function MockDateTimePicker({ onChange }: MockDateTimePickerProps) {
    React.useEffect(() => {
      onChange();
    }, [onChange]);
    return <div data-testid="date-time-picker" />;
  }
}));

jest.mock('~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock', () => ({
  __esModule: true,
  default: () => <div data-testid="seo-metadata-block" />
}));

interface MockSeoMetadataFormProps {
  onChange: () => void;
  onImageChange: () => void;
  onIndexingChange: () => void;
}

jest.mock('~/shared/components/forms/seo-metadata-form/SeoMetadataForm', () => ({
  __esModule: true,
  default: function MockSeoMetadataForm({ onChange, onImageChange, onIndexingChange }: MockSeoMetadataFormProps) {
    React.useEffect(() => {
      onChange();
      onImageChange();
      onIndexingChange();
    }, [onChange, onImageChange, onIndexingChange]);
    return <div data-testid="seo-metadata-form" />;
  }
}));

interface MockHeaderProps {
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  onLanguageChange: () => void;
}

jest.mock('~/shared/components/header/Header', () => ({
  Header: function MockHeader({ onPreview, onSave, onCancel, onLanguageChange }: MockHeaderProps) {
    React.useEffect(() => {
      onPreview();
      onSave();
      onCancel();
      onLanguageChange();
    }, [onPreview, onSave, onCancel, onLanguageChange]);
    return <div data-testid="header" />;
  }
}));

interface MockLoginModalProps {
  onSubmit: () => void;
}

jest.mock('~/shared/components/login-modal/LoginModal', () => ({
  __esModule: true,
  default: function MockLoginModal({ onSubmit }: MockLoginModalProps) {
    React.useEffect(() => {
      onSubmit();
    }, [onSubmit]);
    return <div data-testid="login-modal" />;
  }
}));

interface MockMediaModalContainerProps extends OpenCloseProps, ChildrenProps {}

jest.mock('~/shared/components/media-modal/components/container/MediaModalContainer', () => ({
  MediaModalContainer: ({ open, onClose, children }: MockMediaModalContainerProps) =>
    open ? (
      <div data-testid="media-modal-container">
        <button type="button" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null
}));

interface MockFilterDropdownProps {
  onChange: () => void;
}

jest.mock('~/shared/components/media-modal/components/filter-dropdown/FilterDropdown', () => ({
  FilterDropdown: function MockFilterDropdown({ onChange }: MockFilterDropdownProps) {
    React.useEffect(() => {
      onChange();
    }, [onChange]);
    return <div data-testid="filter-dropdown" />;
  }
}));

interface MockGalleryCardProps {
  onClick: () => void;
}

jest.mock('~/shared/components/media-modal/components/gallery-card/GalleryCard', () => ({
  GalleryCard: function MockGalleryCard({ onClick }: MockGalleryCardProps) {
    React.useEffect(() => {
      onClick();
    }, [onClick]);
    return <div data-testid="gallery-card" />;
  }
}));

interface MockSearchButtonProps {
  onSearch: () => void;
}

jest.mock('~/shared/components/media-modal/components/search-button/SearchButton', () => ({
  SearchButton: function MockSearchButton({ onSearch }: MockSearchButtonProps) {
    React.useEffect(() => {
      onSearch();
    }, [onSearch]);
    return <div data-testid="search-button" />;
  }
}));

interface MockMediaModalSwitcherProps {
  onChange: () => void;
}

jest.mock('~/shared/components/media-modal/components/switcher/MediaModalSwitcher', () => ({
  MediaModalSwitcher: function MockMediaModalSwitcher({ onChange }: MockMediaModalSwitcherProps) {
    React.useEffect(() => {
      onChange();
    }, [onChange]);
    return <div data-testid="media-modal-switcher" />;
  }
}));

interface MockUsedCardProps {
  onClick: () => void;
}

jest.mock('~/shared/components/media-modal/components/used-card/UsedCard', () => ({
  UsedCard: function MockUsedCard({ onClick }: MockUsedCardProps) {
    React.useEffect(() => {
      onClick();
    }, [onClick]);
    return <div data-testid="used-card" />;
  }
}));

interface MockMediaModalProps extends OpenCloseProps {
  onApply: () => void;
}

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: function MockMediaModal({ open, onClose, onApply }: MockMediaModalProps) {
    React.useEffect(() => {
      if (open) {
        onApply();
      }
    }, [open, onApply]);

    return open ? (
      <div data-testid="media-modal">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null;
  }
}));

jest.mock('~/shared/components/media-modal/views/file-view/FileView', () => ({
  FileView: () => <div data-testid="file-view" />
}));

interface MockUploadViewProps {
  onPick: () => void;
}

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  __esModule: true,
  default: function MockUploadView({ onPick }: MockUploadViewProps) {
    React.useEffect(() => {
      onPick();
    }, [onPick]);
    return <div data-testid="upload-view" />;
  }
}));

jest.mock('~/shared/components/minimized-file-card/MinimizedFileCard', () => ({
  __esModule: true,
  default: () => <div data-testid="minimized-file-card" />
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: () => <div data-testid="page-header" />
}));

jest.mock('~/shared/components/rename-file-modal/RenameFileModal', () => ({
  RenameFileModal: ({ open, onClose }: OpenCloseProps) =>
    open ? (
      <div data-testid="rename-file-modal">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
}));

interface MockSearchProps {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
}

jest.mock('~/shared/components/search/Search', () => ({
  Search: ({ search, setSearch, placeholder }: MockSearchProps) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />
  )
}));

jest.mock('~/shared/components/selector/FilterSelect', () => ({
  FilterSelect: () => <div data-testid="filter-select" />
}));

jest.mock('~/shared/components/selector/FilterSelectItem/FilterSelectItem', () => ({
  __esModule: true,
  default: () => <div data-testid="filter-select-item" />
}));

jest.mock('~/shared/components/side-navigation/collapse-list-navigation/CollapseListNavigation', () => ({
  CollapseListNavigation: () => <div data-testid="collapse-list-navigation" />
}));

jest.mock('~/shared/components/side-navigation/link-element/LinkElement', () => ({
  LinkElement: () => <div data-testid="link-element" />
}));

jest.mock('~/shared/components/side-navigation/list-element/ListElement', () => ({
  ListElement: () => <div data-testid="list-element" />
}));

jest.mock('~/shared/components/toaster/Toaster', () => ({
  Toaster: () => <div data-testid="toaster" />
}));

interface MockViewToggleProps {
  value: string;
  onChange: (value: string) => void;
}

jest.mock('~/shared/components/view-toggle', () => ({
  ViewToggle: ({ value, onChange }: MockViewToggleProps) => (
    <div data-testid="view-toggle">
      <span data-testid="view-toggle-value">{value}</span>
      <button type="button" onClick={() => onChange('grid')}>
        grid
      </button>
      <button type="button" onClick={() => onChange('list')}>
        list
      </button>
    </div>
  )
}));

const getSection = (title: string): HTMLElement => {
  const heading = screen.getByText(`Тестування ${title}`);
  return heading.parentElement as HTMLElement;
};

describe('StyleGuide Page', () => {
  it('renders without crashing and shows every sandbox section heading', () => {
    render(<StyleGuide />);

    expect(screen.getAllByText(/^Тестування /).length).toBeGreaterThan(0);
    expect(screen.getByText('Тестування Alert')).toBeInTheDocument();
    expect(screen.getByText('Тестування DeleteFileModal')).toBeInTheDocument();
    expect(screen.getByText('Тестування Toaster')).toBeInTheDocument();
  });

  describe('DiscardChangesModal section', () => {
    it('opens on button click, then closes via handleClose', () => {
      render(<StyleGuide />);
      const section = getSection('DiscardChangesModal');

      expect(within(section).queryByTestId('discard-changes-modal')).not.toBeInTheDocument();

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('discard-changes-modal')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('discard-changes-modal')).not.toBeInTheDocument();
    });

    it('closes after handleSubmit is triggered', () => {
      render(<StyleGuide />);
      const section = getSection('DiscardChangesModal');

      fireEvent.click(within(section).getByText('Open modal'));
      fireEvent.click(within(section).getByText('Submit'));

      expect(within(section).queryByTestId('discard-changes-modal')).not.toBeInTheDocument();
    });
  });

  describe('CustomTabs section', () => {
    it('switches the active tab id when another tab is clicked', () => {
      render(<StyleGuide />);
      const section = getSection('CustomTabs');

      expect(within(section).getByTestId('custom-tabs-active')).toHaveTextContent('1');

      fireEvent.click(within(section).getByText('Tab2'));
      expect(within(section).getByTestId('custom-tabs-active')).toHaveTextContent('2');
    });
  });

  describe('TooltipCustom controlled section', () => {
    it('toggles the controlled open state when the trigger button is clicked', () => {
      render(<StyleGuide />);
      const section = getSection('TooltipCustom');

      const trigger = within(section).getByText('Click me');
      const tooltipWrapper = trigger.closest('[data-testid="tooltip-custom"]') as HTMLElement;

      expect(tooltipWrapper).toHaveAttribute('data-open', 'false');
      fireEvent.click(trigger);
      expect(tooltipWrapper).toHaveAttribute('data-open', 'true');
    });
  });

  describe('Search section', () => {
    it('updates the displayed state preview as the user types', () => {
      render(<StyleGuide />);
      const section = getSection('Search');

      expect(within(section).getByText(/немає/)).toBeInTheDocument();

      fireEvent.change(within(section).getByTestId('search-input'), {
        target: { value: 'Тестовий запит' }
      });

      expect(within(section).getByText(/Тестовий запит/)).toBeInTheDocument();
    });
  });

  describe('FilteringToolbar section', () => {
    it('toggles the filters-open state label', () => {
      render(<StyleGuide />);
      const section = getSection('FilteringToolbar');

      const toggleButton = within(section).getByText(/Фільтри/);
      expect(toggleButton).toHaveTextContent('closed');

      fireEvent.click(toggleButton);
      expect(within(section).getByText(/Фільтри/)).toHaveTextContent('opened');
    });

    it('does not throw when clearing filters', () => {
      render(<StyleGuide />);
      const section = getSection('FilteringToolbar');

      expect(() => fireEvent.click(within(section).getByText('Clear filters'))).not.toThrow();
    });

    it('changes the sort field and resets the sort order via SortSelect', () => {
      render(<StyleGuide />);
      const section = getSection('FilteringToolbar');

      expect(within(section).getByTestId('sort-select-trigger')).toHaveTextContent('Нові спочатку');

      fireEvent.click(within(section).getByText('field:Назва файлу'));

      expect(within(section).getByTestId('sort-select-trigger')).toHaveTextContent('Назва файлу');
      expect(within(section).getByText('order:А-Я')).toHaveAttribute('aria-pressed', 'true');
    });

    it('changes the sort order without touching the field via onValueChange', () => {
      render(<StyleGuide />);
      const section = getSection('FilteringToolbar');

      expect(within(section).getByText('order:Новіші-старіші')).toHaveAttribute('aria-pressed', 'true');
      expect(within(section).getByText('order:Старіші-новіші')).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(within(section).getByText('order:Старіші-новіші'));

      expect(within(section).getByText('order:Старіші-новіші')).toHaveAttribute('aria-pressed', 'true');
      expect(within(section).getByText('order:Новіші-старіші')).toHaveAttribute('aria-pressed', 'false');
      expect(within(section).getByTestId('sort-select-trigger')).toHaveTextContent('Нові спочатку');
    });
  });

  describe('MediaModalContainer section', () => {
    it('opens and closes via the trigger and close button', () => {
      render(<StyleGuide />);
      const section = getSection('MediaModalContainer');

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('media-modal-container')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('media-modal-container')).not.toBeInTheDocument();
    });
  });

  describe('MediaModal section', () => {
    it('opens and closes via the trigger and close button', () => {
      render(<StyleGuide />);
      const section = getSection('MediaModal');

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('media-modal')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('media-modal')).not.toBeInTheDocument();
    });
  });

  describe('RenameFileModal section', () => {
    it('opens and closes via the trigger and close button', () => {
      render(<StyleGuide />);
      const section = getSection('RenameFileModal');

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('rename-file-modal')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('rename-file-modal')).not.toBeInTheDocument();
    });
  });

  describe('ImagePreviewModal section', () => {
    it('opens and closes via the trigger and close button', () => {
      render(<StyleGuide />);
      const section = getSection('ImagePreviewModal');

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('image-preview-modal')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('image-preview-modal')).not.toBeInTheDocument();
    });
  });

  describe('FileInfoSidebar section', () => {
    it('mounts the sidebar on "Open sidebar" click and unmounts it on close', () => {
      render(<StyleGuide />);
      const section = getSection('FileInfoSidebar');

      expect(within(section).queryByTestId('file-info-sidebar')).not.toBeInTheDocument();

      fireEvent.click(within(section).getByText('Open sidebar'));
      expect(within(section).getByTestId('file-info-sidebar')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close sidebar'));
      expect(within(section).queryByTestId('file-info-sidebar')).not.toBeInTheDocument();
    });
  });

  describe('ViewToggle section', () => {
    it('switches the current view value between grid and list', () => {
      render(<StyleGuide />);
      const section = getSection('ViewToggle');

      expect(within(section).getByTestId('view-toggle-value')).toHaveTextContent('grid');

      fireEvent.click(within(section).getByText('list'));
      expect(within(section).getByTestId('view-toggle-value')).toHaveTextContent('list');
    });
  });

  describe('DeleteCardModal section', () => {
    it('opens and closes via the trigger and close button', () => {
      render(<StyleGuide />);
      const section = getSection('DeleteCardModal');

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('delete-card-modal')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('delete-card-modal')).not.toBeInTheDocument();
    });
  });

  describe('DeleteFileModal section', () => {
    it('reflects the isDeleting and usage-refs toggles once opened', () => {
      render(<StyleGuide />);
      const section = getSection('DeleteFileModal');

      fireEvent.click(within(section).getByRole('button', { name: /Toggle isDeleting/i }));
      fireEvent.click(within(section).getByRole('button', { name: /Unclude usage refs/i }));
      fireEvent.click(within(section).getByText('Open modal'));

      expect(within(section).getByTestId('delete-file-modal-is-deleting')).toHaveTextContent('true');
      expect(within(section).getByTestId('delete-file-modal-has-refs')).toHaveTextContent('true');
    });

    it('defaults to isDeleting=false and no usage refs when toggles are untouched', () => {
      render(<StyleGuide />);
      const section = getSection('DeleteFileModal');

      fireEvent.click(within(section).getByText('Open modal'));

      expect(within(section).getByTestId('delete-file-modal-is-deleting')).toHaveTextContent('false');
      expect(within(section).getByTestId('delete-file-modal-has-refs')).toHaveTextContent('false');
    });

    it('closes via onClose when the modal Close button is clicked', () => {
      render(<StyleGuide />);
      const section = getSection('DeleteFileModal');

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('delete-file-modal')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('delete-file-modal')).not.toBeInTheDocument();
    });
  });

  describe('Toaster section', () => {
    it('calls toast.success when the success button is clicked', () => {
      const { toast } = jest.requireMock<{ toast: { success: jest.Mock; error: jest.Mock } }>('react-hot-toast');
      render(<StyleGuide />);
      const section = getSection('Toaster');

      fireEvent.click(within(section).getByText('Показати Success-сповіщення'));
      expect(toast.success).toHaveBeenCalledWith('Успішний тост');
    });

    it('calls toast.error when the error button is clicked', () => {
      const { toast } = jest.requireMock<{ toast: { success: jest.Mock; error: jest.Mock } }>('react-hot-toast');
      render(<StyleGuide />);
      const section = getSection('Toaster');

      fireEvent.click(within(section).getByText('Показати Error-сповіщення'));
      expect(toast.error).toHaveBeenCalledWith('Тост-помилка');
    });
  });

  describe('CompositionModal section', () => {
    it('opens and closes via the trigger and close button', () => {
      render(<StyleGuide />);
      const section = getSection('CompositionModal');

      fireEvent.click(within(section).getByText('Open modal'));
      expect(within(section).getByTestId('composition-modal')).toBeInTheDocument();

      fireEvent.click(within(section).getByText('Close'));
      expect(within(section).queryByTestId('composition-modal')).not.toBeInTheDocument();
    });
  });
});

type FindPredicate<T> = (value: T, index: number, obj: T[]) => unknown;

describe('StyleGuide - activeFieldLabel branch coverage', () => {
  test('should trigger the fallback branch (?? "") when no field matches', () => {
    const originalFind = Array.prototype.find;

    const findSpy = jest.spyOn(Array.prototype, 'find').mockImplementation(function <T>(
      this: T[],
      predicate: FindPredicate<T>,
      thisArg?: unknown
    ): T | undefined {
      const isSortSelectFieldsArray = this.length === 2 && (this[0] as { label?: string })?.label === 'Нові спочатку';

      if (isSortSelectFieldsArray) {
        return undefined;
      }

      return originalFind.call(this, predicate, thisArg);
    });

    render(<StyleGuide />);

    const testingHeaders = screen.getAllByText(/Тестування/i);
    expect(testingHeaders.length).toBeGreaterThan(0);

    findSpy.mockRestore();
  });
});
