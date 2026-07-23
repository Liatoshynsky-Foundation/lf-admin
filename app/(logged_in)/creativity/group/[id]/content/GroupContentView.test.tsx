import { fireEvent, render, screen } from '@testing-library/react';
import React, { MouseEvent, ReactNode, SyntheticEvent } from 'react';

import { GroupContentView } from './GroupContentView';
import { useGroupContent } from '~/shared/hooks/use-group-content/useGroupContent';

jest.mock('~/shared/hooks/use-group-content/useGroupContent');

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({
    title,
    children,
    onChange
  }: {
    title: string;
    children: ReactNode;
    onChange?: (event: SyntheticEvent | null, isExpanded: boolean) => void;
  }) => (
    <div data-testid={`collapsible-block-${title}`}>
      <button data-testid={`toggle-${title}`} onClick={() => onChange?.(null, false)}>
        Toggle {title}
      </button>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/creativity/group/details-section/GroupDetailsSection', () => ({
  GroupDetailsSection: () => <div data-testid="group-details-section" />
}));

jest.mock('~/shared/components/creativity/group/intro-section/GroupIntroSection', () => ({
  GroupIntroSection: () => <div data-testid="group-intro-section" />
}));

jest.mock('~/shared/components/creativity/group/photos-section/GroupPhotosSection', () => ({
  GroupPhotosSection: ({ onChange }: { onChange: (photos: unknown[]) => void }) => (
    <div data-testid="group-photos-section">
      <button data-testid="change-photos" onClick={() => onChange([])}>
        Change Photos
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/creativity/group/works-section/GroupWorksSection', () => ({
  GroupWorksSection: ({ onChange }: { onChange: (works: unknown[]) => void }) => (
    <div data-testid="group-works-section">
      <button data-testid="change-works" onClick={() => onChange([])}>
        Change Works
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/creativity/group/performances-section/GroupPerformancesSection', () => ({
  GroupPerformancesSection: ({
    onChangeSectionTitle,
    onChangePerformances
  }: {
    onChangeSectionTitle: (title: string) => void;
    onChangePerformances: (performances: unknown[]) => void;
  }) => (
    <div data-testid="group-performances-section">
      <button data-testid="change-perf-title" onClick={() => onChangeSectionTitle('New Title')}>
        Change Perf Title
      </button>
      <button data-testid="change-perfs" onClick={() => onChangePerformances([])}>
        Change Perfs
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/DividedHeader', () => ({
  __esModule: true,
  default: ({
    onBackClick,
    rightActionsComponent,
    children
  }: {
    onBackClick: () => void;
    rightActionsComponent?: ReactNode;
    children?: ReactNode;
  }) => (
    <div data-testid="divided-header">
      <button onClick={onBackClick}>Back</button>
      {children}
      {rightActionsComponent}
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => ({
  __esModule: true,
  default: ({
    onPublish,
    onMenuOpen
  }: {
    onPublish: () => void;
    onMenuOpen: (e: MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <div data-testid="header-right-actions">
      <button onClick={onPublish}>Publish Action</button>
      <button onClick={(e) => onMenuOpen(e)}>Menu Open</button>
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: ({ title, onMenuOpen }: { title: string; onMenuOpen: (e: MouseEvent<HTMLButtonElement>) => void }) => (
    <button onClick={onMenuOpen} data-testid="title-dropdown">
      {title}
    </button>
  )
}));

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="delete-card-modal">
      <button data-testid="close-modal-button" onClick={onClose}>
        Close Modal
      </button>
    </div>
  )
}));

const mockUseGroupContent = {
  loading: false,
  error: undefined,
  groupData: {
    titlePrefix: 'op.',
    groupNumber: '1',
    groupTitle: { uk: 'Тестова група', en: 'Test group' },
    genre: '',
    additionalText: '',
    creationYear: '',
    endYear: '',
    dateAdditionalText: { uk: '', en: '' },
    status: 'draft',
    parts: { uk: '', en: '' },
    description: { uk: {}, en: {} },
    photos: [],
    performancesTitle: '',
    performances: [],
    compositions: []
  },
  isDirty: false,
  currentLanguage: 'UA',
  errors: {},
  anchors: {},
  setIsDeleteModalOpen: jest.fn(),
  isInfoModalOpen: false,
  publishedTitle: { uk: 'Тестова група', en: 'Test group' },
  isDetailsExpanded: true,
  langKey: 'uk',
  setCurrentLanguage: jest.fn(),
  setIsInfoModalOpen: jest.fn(),
  setIsDetailsExpanded: jest.fn(),
  handleBackClick: jest.fn(),
  handleOpen: jest.fn(),
  handleClose: jest.fn(),
  handleFieldChange: jest.fn(),
  handlePublishClick: jest.fn(),
  handleMenuOptionClick: jest.fn()
};

describe('GroupContentView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useGroupContent as jest.Mock).mockReturnValue(mockUseGroupContent);
  });

  describe('Conditional Rendering', () => {
    it('should render loading state when data is not ready', () => {
      (useGroupContent as jest.Mock).mockReturnValue({ ...mockUseGroupContent, loading: true, groupData: null });
      render(<GroupContentView id="123" />);
      expect(screen.getByText('Завантаження...')).toBeInTheDocument();
    });

    it('should render error state correctly', () => {
      (useGroupContent as jest.Mock).mockReturnValue({ ...mockUseGroupContent, error: new Error('Server Error') });
      render(<GroupContentView id="123" />);
      expect(screen.getByText('Помилка завантаження даних')).toBeInTheDocument();
    });

    it('should render the main layout and all sections successfully', () => {
      render(<GroupContentView id="123" />);
      expect(screen.getByTestId('group-details-section')).toBeInTheDocument();
      expect(screen.getByTestId('group-intro-section')).toBeInTheDocument();
      expect(screen.getByTestId('group-photos-section')).toBeInTheDocument();
      expect(screen.getByTestId('group-works-section')).toBeInTheDocument();
      expect(screen.getByTestId('group-performances-section')).toBeInTheDocument();
    });
  });

  describe('Header & Navigation Actions', () => {
    it('should call handleBackClick when Back button is clicked', () => {
      render(<GroupContentView id="123" />);
      fireEvent.click(screen.getByText('Back'));
      expect(mockUseGroupContent.handleBackClick).toHaveBeenCalledTimes(1);
    });

    it('should call handlePublishClick when Publish action is clicked', () => {
      render(<GroupContentView id="123" />);
      fireEvent.click(screen.getByText('Publish Action'));
      expect(mockUseGroupContent.handlePublishClick).toHaveBeenCalledTimes(1);
    });

    it('should open navigation menu when TitleDropdown is clicked', () => {
      render(<GroupContentView id="123" />);
      fireEvent.click(screen.getByTestId('title-dropdown'));
      expect(mockUseGroupContent.handleOpen).toHaveBeenCalledWith(expect.anything(), 'navigation');
    });

    it('should open publish menu when RightAction menu button is clicked', () => {
      render(<GroupContentView id="123" />);
      fireEvent.click(screen.getByText('Menu Open'));
      expect(mockUseGroupContent.handleOpen).toHaveBeenCalledWith(expect.anything(), 'publish');
    });

    it('should display default fallback title if publishedTitle is empty', () => {
      (useGroupContent as jest.Mock).mockReturnValue({
        ...mockUseGroupContent,
        publishedTitle: { uk: '', en: '' },
        langKey: 'uk'
      });

      render(<GroupContentView id="123" />);

      expect(screen.getByText('Редагування контенту групи')).toBeInTheDocument();
    });
  });

  describe('Menus & Dialogs', () => {
    it('should render language menu options and handle selection', () => {
      const anchorElement = document.createElement('button');
      (useGroupContent as jest.Mock).mockReturnValue({
        ...mockUseGroupContent,
        anchors: { navigation: anchorElement }
      });

      render(<GroupContentView id="123" />);
      const menuItems = screen.getAllByRole('menuitem');
      fireEvent.click(menuItems[1]);

      expect(mockUseGroupContent.setCurrentLanguage).toHaveBeenCalled();
      expect(mockUseGroupContent.handleClose).toHaveBeenCalledWith('navigation');
    });

    it('should render publish menu options and handle action click', () => {
      const anchorElement = document.createElement('button');
      (useGroupContent as jest.Mock).mockReturnValue({ ...mockUseGroupContent, anchors: { publish: anchorElement } });

      render(<GroupContentView id="123" />);

      fireEvent.click(screen.getByText('Опублікувати і вийти'));
      expect(mockUseGroupContent.handleMenuOptionClick).toHaveBeenCalledWith('PUBLISH_AND_EXIT');
    });

    it('should call handleClose("navigation") when navigation menu is closed via Escape', () => {
      const anchorElement = document.createElement('button');
      (useGroupContent as jest.Mock).mockReturnValue({
        ...mockUseGroupContent,
        anchors: { navigation: anchorElement }
      });

      render(<GroupContentView id="123" />);

      const menu = document.querySelector('.MuiMenu-paper');
      if (menu) {
        fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
      }

      expect(mockUseGroupContent.handleClose).toHaveBeenCalledWith('navigation');
    });

    it('should call setIsDeleteModalOpen(false) when DeleteCardModal is closed', () => {
      (useGroupContent as jest.Mock).mockReturnValue({
        ...mockUseGroupContent,
        isDeleteModalOpen: true
      });

      render(<GroupContentView id="123" />);

      fireEvent.click(screen.getByTestId('close-modal-button'));

      expect(mockUseGroupContent.setIsDeleteModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Inline Callbacks & Edge Cases Coverage', () => {
    it('should trigger inline onChange handlers for child sections', () => {
      render(<GroupContentView id="123" />);

      fireEvent.click(screen.getByTestId('toggle-Деталі'));
      expect(mockUseGroupContent.setIsDetailsExpanded).toHaveBeenCalledWith(false);

      fireEvent.click(screen.getByTestId('change-photos'));
      expect(mockUseGroupContent.handleFieldChange).toHaveBeenCalledWith('photos', []);

      fireEvent.click(screen.getByTestId('change-works'));
      expect(mockUseGroupContent.handleFieldChange).toHaveBeenCalledWith('compositions', []);

      fireEvent.click(screen.getByTestId('change-perf-title'));
      expect(mockUseGroupContent.handleFieldChange).toHaveBeenCalledWith('performancesTitle', 'New Title');

      fireEvent.click(screen.getByTestId('change-perfs'));
      expect(mockUseGroupContent.handleFieldChange).toHaveBeenCalledWith('performances', []);
    });

    it('should handle DELETE action click', () => {
      const anchorElement = document.createElement('button');
      (useGroupContent as jest.Mock).mockReturnValue({
        ...mockUseGroupContent,
        anchors: { publish: anchorElement }
      });

      render(<GroupContentView id="123" />);

      fireEvent.click(screen.getByText('Видалити'));
      expect(mockUseGroupContent.handleMenuOptionClick).toHaveBeenCalledWith('DELETE');
    });
    it('should trigger onClose for Menu', () => {
      const anchorElement = document.createElement('button');
      (useGroupContent as jest.Mock).mockReturnValue({
        ...mockUseGroupContent,
        anchors: { publish: anchorElement }
      });

      render(<GroupContentView id="123" />);

      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });

      expect(mockUseGroupContent.handleClose).toHaveBeenCalledWith('publish');
    });
  });
});
