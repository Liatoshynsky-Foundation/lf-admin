import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import FundView from './FundView';
import { ARCHIVE_BASE_PATH } from '~/constants/archive';
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
  default: () => <div data-testid="fund-cases-block" />
}));

jest.mock('~/shared/components/forms/fund-details-block/FundDetailsBlock', () => ({
  __esModule: true,
  default: () => <div data-testid="fund-details-block" />
}));

const mockHasPublishedCasesInFund = jest.fn();
jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useHasPublishedCasesInFund: () => mockHasPublishedCasesInFund
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
    mockHasPublishedCasesInFund.mockResolvedValue(true);
  });

  it('renders the create title, details block, and cases block by default', () => {
    render(<FundView data={buildData()} />);

    expect(screen.getByText('Створення фонду')).toBeInTheDocument();
    expect(screen.getByTestId('fund-details-block')).toBeInTheDocument();
    expect(screen.getByTestId('fund-cases-block')).toBeInTheDocument();
  });

  it('renders the edit title when mode is edit', () => {
    render(<FundView data={buildData()} mode="edit" />);

    expect(screen.getByText('Редагування фонду')).toBeInTheDocument();
  });

  it('calls handleSave with Draft when SAVE is clicked from the publish menu', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    render(<FundView data={buildData({ handleSave })} />);

    await user.click(screen.getByText('open publish menu'));
    await user.click(screen.getByText('Зберегти зміни'));

    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to the archive base path after SAVE_AND_EXIT succeeds', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    render(<FundView data={buildData({ handleSave })} />);

    await user.click(screen.getByText('open publish menu'));
    await user.click(screen.getByText('Зберегти зміни і вийти'));

    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
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
    render(<FundView data={buildData({ handleSave, fundId: 'fund-1', details: { casesCount: 1 } })} />);

    await user.click(screen.getByText('publish'));

    expect(mockHasPublishedCasesInFund).toHaveBeenCalledWith('fund-1');
    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
  });

  it('opens the warning dialog before publishing a fund with no cases', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    render(<FundView data={buildData({ handleSave })} />);

    await user.click(screen.getByText('publish'));

    expect(screen.getByTestId('publish-empty-fund-dialog')).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();

    await user.click(screen.getByText('confirm publish'));

    expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
  });

  it('opens the warning dialog when a fund has cases but none are published', async () => {
    const user = userEvent.setup();
    const handleSave = jest.fn().mockResolvedValue('id-1');
    mockHasPublishedCasesInFund.mockResolvedValue(false);

    render(<FundView data={buildData({ handleSave, fundId: 'fund-1', details: { casesCount: 2 } })} />);

    await user.click(screen.getByText('publish'));

    expect(screen.getByTestId('publish-empty-fund-dialog')).toBeInTheDocument();
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
