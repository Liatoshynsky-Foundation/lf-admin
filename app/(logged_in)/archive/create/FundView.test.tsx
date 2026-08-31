import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

import FundView from './FundView';
import { ARCHIVE_BASE_PATH } from '~/constants/archive';
import { FundErrors } from '~/constants/errors';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush })
}));

const mockSetLocale = jest.fn();
const mockUseStore = jest.fn();
jest.mock('~/store', () => ({
  __esModule: true,
  useStore: (selector: (state: { locale: string; setLocale: (l: string) => void }) => unknown) =>
    mockUseStore(selector)
}));

const mockNavigateBack = jest.fn();
jest.mock('~/shared/hooks/use-navigation-guard/useNavigationGuard', () => ({
  __esModule: true,
  useNavigationGuard: () => ({ navigateBack: mockNavigateBack })
}));

const mockUseUnsavedChanges = jest.fn();
jest.mock('~/shared/hooks/use-unsaved-changes/useUnsavedChanges', () => ({
  __esModule: true,
  useUnsavedChanges: (value: boolean) => mockUseUnsavedChanges(value)
}));

const mockUpdateCase = jest.fn();
jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useUpdateCase: () => [mockUpdateCase]
}));

jest.mock('~/shared/components/divided-header/DividedHeader', () => ({
  __esModule: true,
  default: ({ children, rightActionsComponent }: { children: ReactNode; rightActionsComponent: ReactNode }) => (
    <div data-testid="divided-header">
      {children}
      {rightActionsComponent}
    </div>
  )
}));

let capturedOnPublish: (() => void) | undefined;
let capturedOnMenuOpen: ((e: { currentTarget: HTMLButtonElement }) => void) | undefined;
jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => ({
  __esModule: true,
  default: ({ onPublish, onMenuOpen, showPublish = true }: {
    onPublish: () => void;
    onMenuOpen: (e: { currentTarget: HTMLButtonElement }) => void;
    showPublish?: boolean;
  }) => {
    capturedOnPublish = onPublish;
    capturedOnMenuOpen = onMenuOpen;
    return (
      <div>
        {showPublish && <button onClick={onPublish}>publish</button>}
        <button onClick={(e) => onMenuOpen(e as unknown as { currentTarget: HTMLButtonElement })}>
          open publish menu
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/divided-header/progress-status/ProgressStatus', () => ({
  __esModule: true,
  default: ({ isSaved }: { isSaved: boolean }) => <div data-testid="progress-status">{String(isSaved)}</div>
}));

let capturedOnLanguageMenuOpen: (() => void) | undefined;
jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  __esModule: true,
  TitleDropdown: ({ title, onMenuOpen }: { title: string; onMenuOpen: () => void }) => {
    capturedOnLanguageMenuOpen = onMenuOpen;
    return (
      <div>
        <span>{title}</span>
        <button onClick={onMenuOpen}>open language menu</button>
      </div>
    );
  }
}));

type MenuGroup = { items: { id: string; text: { name: string }; onClick?: () => void }[] };

jest.mock('~/shared/components/dropdown-menu/ActionMenu', () => ({
  __esModule: true,
  default: ({ anchorEl, menuItems, onClose }: { anchorEl: unknown; menuItems: MenuGroup[]; onClose: () => void }) =>
    anchorEl ? (
      <div data-testid="action-menu">
        <button onClick={onClose}>close action menu</button>
        {menuItems.flatMap((group) =>
          group.items.map((item) => (
            <button key={item.id} onClick={item.onClick}>
              {item.text.name}
            </button>
          ))
        )}
      </div>
    ) : null
}));

jest.mock('~/shared/components/forms/fund-cases-block/FundCasesBlock', () => ({
  __esModule: true,
  default: ({ fundId }: { fundId?: string }) => <div data-testid="fund-cases-block" data-fund-id={fundId} />
}));

jest.mock('~/shared/components/forms/fund-details-block/FundDetailsBlock', () => ({
  __esModule: true,
  default: () => <div data-testid="fund-details-block" />
}));

const mockCheckFundPublishWarning = jest.fn();
jest.mock('../(hooks)/useFundPublishWarning', () => ({
  __esModule: true,
  useFundPublishWarning: () => mockCheckFundPublishWarning
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn() }
}));

jest.mock('../(components)/publish-empty-fund-dialog/PublishEmptyFundDialog', () => ({
  __esModule: true,
  PublishEmptyFundDialog: ({
    open,
    onCancel,
    onConfirm
  }: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  }) =>
    open ? (
      <div data-testid="publish-empty-fund-dialog">
        <button onClick={onCancel}>cancel publish</button>
        <button onClick={onConfirm}>confirm publish</button>
      </div>
    ) : null
}));

type MockFundDetails = {
  fundNumber: string;
  name: { uk: string; en: string };
  documentCreationDate: string;
  chronologicalBoundaries: string;
  organizationForm: { uk: string; en: string };
  description: { uk: { type: string; content: never[] }; en: { type: string; content: never[] } };
  casesCount: number;
  descriptionsCount: number;
};

const buildData = (overrides: Partial<{
  isSaved: boolean;
  hasUnsavedChanges: boolean;
  handleSave: jest.Mock;
  currentStatus: BaseContentStatuses | undefined;
  fundId?: string;
  details: Partial<MockFundDetails>;
}> = {}) => ({
  details: {
    fundNumber: '1',
    name: { uk: 'Назва', en: 'Name' },
    documentCreationDate: '1900',
    chronologicalBoundaries: '',
    organizationForm: { uk: '', en: '' },
    description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } },
    casesCount: 0,
    descriptionsCount: 0,
    ...overrides.details
  },
  setDetails: jest.fn(),
  errors: {},
  forceShowErrors: false,
  isSaved: overrides.isSaved ?? true,
  hasUnsavedChanges: overrides.hasUnsavedChanges ?? false,
  currentStatus: 'currentStatus' in overrides ? overrides.currentStatus : BaseContentStatuses.Hidden,
  fundId: overrides.fundId,
  handleSave: overrides.handleSave ?? jest.fn().mockResolvedValue('new-id')
});

describe('FundView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStore.mockImplementation(
      (selector: (state: { locale: string; setLocale: (l: string) => void }) => unknown) =>
        selector({ locale: 'uk', setLocale: mockSetLocale })
    );
    mockCheckFundPublishWarning.mockResolvedValue('publish');
  });

  it('renders the create title and details block by default, without the cases block', () => {
    render(<FundView data={buildData()} />);

    expect(screen.getByText('Створення фонду')).toBeInTheDocument();
    expect(screen.getByTestId('fund-details-block')).toBeInTheDocument();
    expect(screen.queryByTestId('fund-cases-block')).not.toBeInTheDocument();
  });

  it('renders the edit title and cases block when mode is edit', () => {
    render(<FundView data={buildData({ fundId: 'fund-1' })} mode="edit" />);

    expect(screen.getByText('Редагування фонду')).toBeInTheDocument();
    expect(screen.getByTestId('fund-cases-block')).toHaveAttribute('data-fund-id', 'fund-1');
  });

  it('navigates to the edit page after SAVE succeeds in create mode', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    render(<FundView data={buildData({ handleSave })} />);

    await user.click(screen.getByText('open publish menu'));
    await user.click(screen.getByText('Зберегти зміни'));

    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Hidden);
    expect(mockPush).toHaveBeenCalledWith(`${ARCHIVE_BASE_PATH}/fund/id-1/edit`);
  });

  it('does not navigate after SAVE succeeds in edit mode', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    render(<FundView data={buildData({ handleSave, fundId: 'fund-1' })} mode="edit" />);

    await user.click(screen.getByText('open publish menu'));
    await user.click(screen.getByText('Зберегти зміни'));

    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Hidden);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to the archive base path after SAVE_AND_EXIT succeeds', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    render(<FundView data={buildData({ handleSave })} />);

    await user.click(screen.getByText('open publish menu'));
    await user.click(screen.getByText('Зберегти зміни і вийти'));

    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Hidden);
    expect(mockPush).toHaveBeenCalledWith(ARCHIVE_BASE_PATH);
  });

  it('does not navigate after SAVE_AND_EXIT when handleSave returns no id', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue(null);
    render(<FundView data={buildData({ handleSave })} />);

    await user.click(screen.getByText('open publish menu'));
    await user.click(screen.getByText('Зберегти зміни і вийти'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('calls handleSave with Published when the publish button is clicked', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    render(
      <FundView
        data={buildData({ handleSave, fundId: 'fund-1', currentStatus: BaseContentStatuses.Hidden, details: { casesCount: 1 } })}
        mode="edit"
      />
    );

    await user.click(screen.getByText('publish'));

    expect(mockCheckFundPublishWarning).toHaveBeenCalledWith({ fundId: 'fund-1', casesCount: 1 });
    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
  });

  it('opens the warning dialog before publishing a fund with no cases', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    mockCheckFundPublishWarning.mockResolvedValue('show-warning');
    render(
      <FundView
        data={buildData({ handleSave, fundId: 'fund-1', currentStatus: BaseContentStatuses.Hidden })}
        mode="edit"
      />
    );

    await user.click(screen.getByText('publish'));

    expect(screen.getByTestId('publish-empty-fund-dialog')).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();

    await user.click(screen.getByText('confirm publish'));

    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
  });

  it('opens the warning dialog when a fund has cases but none are published', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    mockCheckFundPublishWarning.mockResolvedValue('show-warning');

    render(
      <FundView
        data={buildData({ handleSave, fundId: 'fund-1', currentStatus: BaseContentStatuses.Hidden, details: { casesCount: 2 } })}
        mode="edit"
      />
    );

    await user.click(screen.getByText('publish'));

    expect(screen.getByTestId('publish-empty-fund-dialog')).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('shows an error toast and does not publish when the publish warning check fails', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    mockCheckFundPublishWarning.mockResolvedValue('error');

    render(
      <FundView
        data={buildData({ handleSave, fundId: 'fund-1', currentStatus: BaseContentStatuses.Hidden, details: { casesCount: 2 } })}
        mode="edit"
      />
    );

    await user.click(screen.getByText('publish'));

    expect(toast.error).toHaveBeenCalledWith(FundErrors.FAILED_TO_PUBLISH);
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('hides the publish button when the fund is not hidden', () => {
    render(<FundView data={buildData({ currentStatus: BaseContentStatuses.Published })} mode="edit" />);

    expect(screen.queryByText('publish')).not.toBeInTheDocument();
    expect(screen.getByText('open publish menu')).toBeInTheDocument();
  });

  it('hides the publish button while edit fund status is not loaded yet', () => {
    render(<FundView data={buildData({ currentStatus: undefined })} mode="edit" />);

    expect(screen.queryByText('publish')).not.toBeInTheDocument();
    expect(screen.getByText('open publish menu')).toBeInTheDocument();
  });

  it('closes the publish menu when onClose is triggered', async () => {
    const user = userEvent.setup();
    render(<FundView data={buildData()} />);

    await user.click(screen.getByText('open publish menu'));
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();

    await user.click(screen.getByText('close action menu'));
    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
  });

  it('opens the language menu and switches locale on selection', async () => {
    const user = userEvent.setup();
    render(<FundView data={buildData()} />);

    await user.click(screen.getByText('open language menu'));
    await user.click(screen.getByText('Англійська'));

    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('closes the language menu when onClose is triggered', async () => {
    const user = userEvent.setup();
    render(<FundView data={buildData()} />);

    await user.click(screen.getByText('open language menu'));
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();

    await user.click(screen.getByText('close action menu'));
    expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
  });

  it('exposes the language and publish menu open handlers', () => {
    render(<FundView data={buildData()} />);

    expect(capturedOnLanguageMenuOpen).toBeInstanceOf(Function);
    expect(capturedOnMenuOpen).toBeInstanceOf(Function);
    expect(capturedOnPublish).toBeInstanceOf(Function);
  });
});
