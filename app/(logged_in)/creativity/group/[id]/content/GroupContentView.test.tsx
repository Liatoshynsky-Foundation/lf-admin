import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { GroupContentView } from './GroupContentView';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';

jest.mock('~/shared/hooks/use-navigation-guard/useNavigationGuard', () => ({
  useNavigationGuard: jest.fn()
}));

jest.mock('~/shared/hooks/use-unsaved-changes/useUnsavedChanges', () => ({
  useUnsavedChanges: jest.fn()
}));

type MockHeaderActionsProps = {
  onPublish: () => void;
  disabled: boolean;
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type MockDetailsSectionProps = {
  onChange: (field: string, value: string, isMultilingual?: boolean) => void;
  errors: Record<string, string>;
};

type MockDividedHeaderProps = {
  children: React.ReactNode;
  rightActionsComponent: React.ReactNode;
};

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => ({
  __esModule: true,
  default: ({ onPublish, disabled, onMenuOpen }: MockHeaderActionsProps) => (
    <div data-testid="mock-header-actions">
      <button data-testid="trigger-publish" onClick={onPublish} disabled={disabled}>
        Publish
      </button>
      <button data-testid="trigger-publish-menu" onClick={onMenuOpen}>
        Menu
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/DividedHeader', () => ({
  __esModule: true,
  default: ({ children, rightActionsComponent }: MockDividedHeaderProps) => (
    <div data-testid="mock-divided-header">
      {children}
      {rightActionsComponent}
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: () => <div data-testid="mock-title-dropdown" />
}));

jest.mock('~/shared/components/divided-header/progress-status/ProgressStatus', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-progress-status" />
}));

jest.mock('~/shared/components/badge/Badge', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-badge" />
}));

jest.mock('~/shared/components/creativity/group/details-section/GroupDetailsSection', () => ({
  GroupDetailsSection: ({ onChange, errors }: MockDetailsSectionProps) => (
    <div data-testid="mock-details-section">
      <button data-testid="clear-group-number" onClick={() => onChange('groupNumber', '')} />
      <button data-testid="clear-group-title" onClick={() => onChange('groupTitle', '', true)} />
      <button data-testid="make-valid-change" onClick={() => onChange('additionalText', 'some text')} />
      
      {errors.groupNumber && <span data-testid="error-groupNumber">{errors.groupNumber}</span>}
      {errors.groupTitle && <span data-testid="error-groupTitle">{errors.groupTitle}</span>}
    </div>
  )
}));

jest.mock('~/shared/components/creativity/group/intro-section/GroupIntroSection', () => ({
  GroupIntroSection: () => <div data-testid="mock-intro-section" />
}));

jest.mock('~/shared/components/creativity/group/photos-section/GroupPhotosSection', () => ({
  GroupPhotosSection: () => <div data-testid="mock-photos-section" />
}));

jest.mock('~/shared/components/creativity/group/works-section/GroupWorksSection', () => ({
  GroupWorksSection: () => <div data-testid="mock-works-section" />
}));

jest.mock('~/shared/components/creativity/group/performances-section/GroupPerformancesSection', () => ({
  GroupPerformancesSection: () => <div data-testid="mock-performances-section" />
}));


describe('GroupContentView Container', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigationGuard as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  it('should render the component and all its sections successfully', () => {
    render(<GroupContentView id="123" />);
    expect(screen.getByText('Заповнення контентом не є обов’язковим')).toBeInTheDocument();
  });

  it('should track unsaved changes using useUnsavedChanges hook when fields are modified', () => {
    render(<GroupContentView id="123" />);
    expect(useUnsavedChanges).toHaveBeenCalledWith(false);
    
    fireEvent.click(screen.getByTestId('make-valid-change'));
    expect(useUnsavedChanges).toHaveBeenCalledWith(true);
  });

  it('should open the info modal when "Publish" is clicked and data is valid', () => {
    render(<GroupContentView id="123" />);

    fireEvent.click(screen.getByTestId('make-valid-change'));
    fireEvent.click(screen.getByTestId('trigger-publish'));
    expect(screen.getByText('Сторінка у розробці')).toBeInTheDocument();
  });

  it('should close the info modal when the "Зрозуміло" button is clicked', async () => {
    render(<GroupContentView id="123" />);

    fireEvent.click(screen.getByTestId('make-valid-change'));
    fireEvent.click(screen.getByTestId('trigger-publish'));
    expect(screen.getByText('Сторінка у розробці')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Зрозуміло'));

    await waitFor(() => {
      expect(screen.queryByText('Сторінка у розробці')).not.toBeInTheDocument();
    });
  });

  it('should show validation errors and NOT open the modal if required fields are empty', () => {
    render(<GroupContentView id="123" />);

    fireEvent.click(screen.getByTestId('clear-group-number'));
    fireEvent.click(screen.getByTestId('clear-group-title'));

    fireEvent.click(screen.getByTestId('trigger-publish'));

    expect(screen.queryByText('Сторінка у розробці')).not.toBeInTheDocument();

    expect(screen.getByTestId('error-groupNumber')).toHaveTextContent('Обов’язкове поле');
    expect(screen.getByTestId('error-groupTitle')).toHaveTextContent('Обов’язкове поле');
  });

  it('should open the info modal when selecting a valid option from the dropdown menu', () => {
    render(<GroupContentView id="123" />);

    fireEvent.click(screen.getByTestId('trigger-publish-menu'));
    fireEvent.click(screen.getByText('Опублікувати і вийти'));

    expect(screen.getByText('Сторінка у розробці')).toBeInTheDocument();
  });
});
