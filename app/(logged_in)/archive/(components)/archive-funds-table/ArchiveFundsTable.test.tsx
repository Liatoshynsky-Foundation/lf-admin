import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';

import { ArchiveCase, FundsTable, FundsTableProps } from './ArchiveFundsTable';
import {
  ARCHIVE_EMPTY_STATE_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE,
  ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE,
  ARCHIVE_EMPTY_STATE_TITLE,
  ARCHIVE_FUNDS_TABLE_HEADERS
} from '~/constants/archive';
import { BaseRowData, ColumnDef } from '~/shared/components/table-layout/row-variants/Row.types';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

type EmptyStateProps = {
  title: string;
  description?: string;
};

type TableLayoutProps<TGroup, TSub, TPlain> = {
  data: readonly BaseRowData<TGroup, TSub, TPlain>[];
  columns: readonly ColumnDef<TGroup, TSub, TPlain>[];
};

const COPY_LINK_SUCCESS_MESSAGE = 'Посилання скопійовано в буфер обміну.';
const COPY_LINK_ERROR_MESSAGE = 'Не вдалося скопіювати посилання. Спробуйте ще раз.';

const mockDeleteFund = jest.fn();
const mockDeleteCase = jest.fn();
const mockUpdateCase = jest.fn();
jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  useDeleteFund: () => [mockDeleteFund],
  useDeleteCase: () => [mockDeleteCase],
  useUpdateCase: () => [mockUpdateCase]
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

jest.mock('../ArchiveCaseModal', () => ({
  ArchiveCaseModal: (props: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSaved: () => Promise<unknown>;
    caseId: string;
    fundId: string;
  }) => (
    <div data-testid="mock-case-modal">
      <span data-testid="mock-case-modal-caseId">{props.caseId}</span>
      <span data-testid="mock-case-modal-fundId">{props.fundId}</span>
      <button data-testid="mock-case-modal-close" onClick={() => props.setIsOpen(false)}>
        Close
      </button>
      <button data-testid="mock-case-modal-save" onClick={() => props.onSaved()}>
        Save
      </button>
    </div>
  )
}));

const setClipboardWriteText = (impl: (text: string) => Promise<void>) => {
  const writeText = jest.fn(impl);
  if (navigator.clipboard) {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: writeText,
      configurable: true,
      writable: true
    });
  } else {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true
    });
  }
  return writeText;
};

const clearClipboardWriteText = () => {
  if (navigator.clipboard) {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: undefined,
      configurable: true,
      writable: true
    });
  } else {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true
    });
  }
};

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description }: EmptyStateProps) => (
    <div data-testid="mock-empty-state">
      <div data-testid="mock-empty-state-title">{title}</div>
      <div data-testid="mock-empty-state-description">{description}</div>
    </div>
  )
}));

jest.mock('~/shared/components/delete-composition-modal/DeleteCompositionModal', () => ({
  DeleteCompositionModal: (props: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    description: string;
  }) => (
    <div data-testid="mock-delete-modal" data-open={props.open}>
      <span>{props.description}</span>
      <button onClick={props.onClose} data-testid="mock-delete-close">
        Close
      </button>
      <button onClick={props.onConfirm} data-testid="mock-delete-confirm">
        Confirm
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/components/RowActions', () => ({
  RowActions: ({
    editAction,
    menuActions
  }: {
    editAction?: { onEditClick?: () => void };
    menuActions: { menuItems: { items: { id: string; onClick?: () => void }[] }[] };
  }) => (
    <div data-testid="row-actions">
      {editAction?.onEditClick && (
        <button data-testid="edit-action-direct" onClick={editAction.onEditClick}>
          edit-direct
        </button>
      )}
      {menuActions.menuItems
        .flatMap((group) => group.items)
        .map((item) => (
          <button key={item.id} data-testid={`action-${item.id}`} onClick={item.onClick}>
            {item.id}
          </button>
        ))}
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/components/StatusBadge');

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: <TGroup, TSub, TPlain>({ data, columns }: TableLayoutProps<TGroup, TSub, TPlain>) => (
    <div data-testid="mock-table-layout">
      <div data-testid="mock-table-layout-columns">
        {columns.map((col) => (
          <span key={col.id} data-testid={`mock-table-layout-column-${col.id}`}>
            {col.headerLabel}
          </span>
        ))}
      </div>
      <div data-testid="mock-table-layout-data">
        {data
          .filter((item) => item.type === 'individual')
          .map((item) => (
            <div key={item.id} data-testid={`mock-table-layout-row-${item.id}`}>
              <span data-testid="row-json">{JSON.stringify(item)}</span>
              {columns.map((col) => (
                <span key={col.id} data-testid={`mock-cell-${col.id}`}>
                  {col.renderPlain ? col.renderPlain(item.plainData) : null}
                </span>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}));

const defaultProps: FundsTableProps = {
  funds: [
    {
      id: '1',
      fundNumber: 1,
      name: 'Фонд 1',
      descriptions: 10,
      cases: 20,
      dates: '1990 - 2000',
      status: BaseContentStatuses.Published,
      updatedAt: '2023-01-01'
    }
  ],
  hasActiveSearch: false,
  hasActiveStatusFilter: false
};

const renderComponent = (overrides?: Partial<FundsTableProps>) => {
  return render(<FundsTable {...defaultProps} {...overrides} />);
};

const fund = defaultProps.funds[0];
const rowWithActions = {
  type: 'individual',
  id: fund.id,
  plainData: {
    ...defaultProps.funds[0],
    editAction: {
      editHref: `/archive/fund/${fund.id}/edit`,
      editLabel: `Редагувати фонд Фонд ${fund.id}`
    },

    menuActions: {
      menuItems: [
        {
          items: [
            { id: 'edit', text: { name: 'Редагувати' }, href: `/archive/fund/${fund.id}/edit` },
            { id: 'share', text: { name: 'Поширити' } }
          ]
        },
        { items: [{ id: 'delete', text: { name: 'Видалити' } }] }
      ],
      menuTriggerLabel: `Дії для фонду Фонд ${fund.id}`
    }
  }
};

describe('ArchiveFundsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all columns and rows with funds data', () => {
    renderComponent();

    expect(screen.getByTestId('mock-table-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-columns')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-layout-data')).toBeInTheDocument();
    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent(JSON.stringify(rowWithActions));
  });

  it.each([
    { column: 'fundNumber', value: ARCHIVE_FUNDS_TABLE_HEADERS.fund },
    { column: 'name', value: ARCHIVE_FUNDS_TABLE_HEADERS.name },
    { column: 'descriptionsCount', value: ARCHIVE_FUNDS_TABLE_HEADERS.descr },
    { column: 'casesCount', value: ARCHIVE_FUNDS_TABLE_HEADERS.cases },
    { column: 'dates', value: ARCHIVE_FUNDS_TABLE_HEADERS.dates },
  ])('should render the $column column with value $value', ({ column, value }) => {
    renderComponent();
    expect(screen.getByTestId(`mock-table-layout-column-${column}`)).toHaveTextContent(value);
  });

  it.each([
    { cell: 'fundNumber', value: String(fund.fundNumber) },
    { cell: 'name', value: fund.name },
    { cell: 'descriptionsCount', value: String(fund.descriptions) },
    { cell: 'casesCount', value: String(fund.cases) },
    { cell: 'dates', value: fund.dates },
    { cell: 'status', value: undefined },
    { cell: 'actions', value: undefined },
  ])('should render the $cell cell with value $value', ({ cell, value }) => {
    renderComponent();
    if (value) {
      expect(screen.getByTestId(`mock-cell-${cell}`)).toHaveTextContent(value);
    } else {
      expect(screen.getByTestId(`mock-cell-${cell}`)).toBeInTheDocument();
    }
  });

  describe('Delete Fund Flow', () => {
    it('should handle opening the delete modal, closing it, and confirming deletion', async () => {
      const user = userEvent.setup();
      const onDeletedMock = jest.fn();
      renderComponent({ onDeleted: onDeletedMock });

      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteFund).not.toHaveBeenCalled();

      await user.click(screen.getByTestId('action-delete'));
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'true');
      expect(
        screen.getByText(new RegExp(`Ви впевнені, що хочете видалити фонд «${fund.name}»\\?`))
      ).toBeInTheDocument();

      await user.click(screen.getByTestId('mock-delete-close'));
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');

      await user.click(screen.getByTestId('action-delete'));
      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteFund).toHaveBeenCalledWith({ id: fund.id });
      expect(onDeletedMock).toHaveBeenCalled();
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');
    });

    it('should not call onDeleted if it is not provided', async () => {
      const user = userEvent.setup();
      renderComponent({ onDeleted: undefined });

      await user.click(screen.getByTestId('action-delete'));
      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteFund).toHaveBeenCalledWith({ id: fund.id });
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');
    });
  });

  it('should add the publish action for hidden funds when publish handler is provided', () => {
    renderComponent({
      funds: [{ ...fund, status: BaseContentStatuses.Hidden }],
      onPublish: jest.fn()
    });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent('Опублікувати');
    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent('"id":"publish"');
  });

  it('should call onPublish when the publish action is clicked', async () => {
    const onPublishMock = jest.fn();
    const user = userEvent.setup();
    renderComponent({
      funds: [{ ...fund, status: BaseContentStatuses.Hidden }],
      onPublish: onPublishMock
    });

    await user.click(screen.getByTestId('action-publish'));

    expect(onPublishMock).toHaveBeenCalledWith({ ...fund, status: BaseContentStatuses.Hidden });
  });

  it('should not add the publish action for non-hidden funds', () => {
    renderComponent({ onPublish: jest.fn() });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('Опублікувати');
    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('"id":"publish"');
  });

  it('should add the unpublish action for published funds when unpublish handler is provided', () => {
    renderComponent({
      funds: [{ ...fund, status: BaseContentStatuses.Published }],
      onUnpublish: jest.fn()
    });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).toHaveTextContent('"id":"unpublish"');
  });

  it('should call onUnpublish when the unpublish action is clicked', async () => {
    const onUnpublishMock = jest.fn();
    const user = userEvent.setup();
    renderComponent({
      funds: [{ ...fund, status: BaseContentStatuses.Published }],
      onUnpublish: onUnpublishMock
    });

    await user.click(screen.getByTestId('action-unpublish'));

    expect(onUnpublishMock).toHaveBeenCalledWith({ ...fund, status: BaseContentStatuses.Published });
  });

  it('should not add the unpublish action for non-published funds', () => {
    renderComponent({
      funds: [{ ...fund, status: BaseContentStatuses.Hidden }],
      onUnpublish: jest.fn()
    });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('"id":"unpublish"');
  });

  it('should not add the unpublish action when no unpublish handler is provided', () => {
    renderComponent({ funds: [{ ...fund, status: BaseContentStatuses.Published }] });

    expect(screen.getByTestId(`mock-table-layout-row-${fund.id}`)).not.toHaveTextContent('"id":"unpublish"');
  });

  describe('should render state UIs', () => {
    it('should render the "not created yet" fallback when there are no funds and no active criteria', () => {
      renderComponent({ funds: [], hasActiveSearch: false, hasActiveStatusFilter: false });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('mock-empty-state-description')).toHaveTextContent(ARCHIVE_EMPTY_STATE_DESCRIPTION);
    });

    it.each([
      { hasActiveStatusFilter: false, scenario: 'search is active without a status filter' },
      { hasActiveStatusFilter: true, scenario: 'both search and status filter are active' }
    ])('should render the no search results fallback when $scenario', ({ hasActiveStatusFilter }) => {
      renderComponent({ funds: [], hasActiveSearch: true, hasActiveStatusFilter });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE);
      expect(screen.getByTestId('mock-empty-state-description')).toHaveTextContent(
        ARCHIVE_EMPTY_STATE_NO_RESULTS_DESCRIPTION
      );
    });

    it('should render the status-only fallback when only the status filter is active', () => {
      renderComponent({ funds: [], hasActiveSearch: false, hasActiveStatusFilter: true });

      expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('mock-empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_STATUS_MATCH_TITLE);
    });
  });

  describe('Share Fund Flow', () => {
    afterEach(() => {
      clearClipboardWriteText();
      Reflect.deleteProperty(document, 'execCommand');
    });

    it.each([
      { scenario: 'succeeds', impl: () => Promise.resolve(), expectToast: 'success' as const },
      { scenario: 'rejects', impl: () => Promise.reject(new Error('denied')), expectToast: 'error' as const }
    ])('should show a $expectToast toast when the Clipboard API $scenario', async ({ impl, expectToast }) => {
      const writeText = setClipboardWriteText(impl);
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('action-share'));

      if (expectToast === 'success') {
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining(`/archive/fund/${fund.id}/edit`));
        expect(toast.success).toHaveBeenCalledWith(COPY_LINK_SUCCESS_MESSAGE);
      } else {
        expect(toast.error).toHaveBeenCalledWith(COPY_LINK_ERROR_MESSAGE);
      }
    });

    it.each([
      { execCommandResult: true, expectToast: 'success' as const },
      { execCommandResult: false, expectToast: 'error' as const }
    ])(
      'should fall back to execCommand copy and show a $expectToast toast when the Clipboard API is unavailable',
      async ({ execCommandResult, expectToast }) => {
        clearClipboardWriteText();
        const execCommand = jest.fn().mockReturnValue(execCommandResult);
        Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true, writable: true });
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByTestId('action-share'));

        expect(execCommand).toHaveBeenCalledWith('copy');
        if (expectToast === 'success') {
          expect(toast.success).toHaveBeenCalledWith(COPY_LINK_SUCCESS_MESSAGE);
        } else {
          expect(toast.error).toHaveBeenCalledWith(COPY_LINK_ERROR_MESSAGE);
        }
      }
    );
  });

  describe('Case rows', () => {
    const caseItem: ArchiveCase = {
      id: 'c1',
      name: 'Справа 1',
      fundId: 'f1',
      cipher: '1-1-1',
      caseNumber: 5,
      descriptionNumber: 2,
      sheetsNumber: 100,
      editCaseDate: '2020-01-01',
      editCaseDescriptions: 'опис',
      detailedCaseDescription: 'детальний опис',
      status: BaseContentStatuses.Published,
      updatedAt: '2023-05-01'
    };

    const renderWithCase = (overrides?: Partial<FundsTableProps> & { caseOverrides?: Partial<ArchiveCase> }) => {
      const { caseOverrides, ...rest } = overrides ?? {};
      return renderComponent({
        funds: [],
        cases: [{ ...caseItem, ...caseOverrides }],
        ...rest
      });
    };

    it('should render a case row with its edit, share, toggle-status and delete actions', () => {
      renderWithCase();

      const row = screen.getByTestId(`mock-table-layout-row-${caseItem.id}`);
      expect(row).toBeInTheDocument();
      expect(screen.getByTestId('action-edit')).toBeInTheDocument();
      expect(screen.getByTestId('action-share')).toBeInTheDocument();
      expect(screen.getByTestId('action-toggle-status')).toBeInTheDocument();
      expect(screen.getByTestId('action-delete')).toBeInTheDocument();
    });

    it.each([
      { status: BaseContentStatuses.Published, expectedLabel: 'Сховати' },
      { status: BaseContentStatuses.Hidden, expectedLabel: 'Опублікувати' }
    ])('should label the toggle action "$expectedLabel" for a $status case', ({ status, expectedLabel }) => {
      renderWithCase({ caseOverrides: { status } });

      expect(screen.getByTestId('action-toggle-status')).toHaveTextContent('toggle-status');
      expect(screen.getByTestId(`mock-table-layout-row-${caseItem.id}`)).toHaveTextContent(expectedLabel);
    });

    it('should open the edit modal for a case, and close it', async () => {
      const user = userEvent.setup();
      renderWithCase();

      await user.click(screen.getByTestId('action-edit'));

      expect(screen.getByTestId('mock-case-modal')).toBeInTheDocument();
      expect(screen.getByTestId('mock-case-modal-caseId')).toHaveTextContent(caseItem.id);
      expect(screen.getByTestId('mock-case-modal-fundId')).toHaveTextContent(caseItem.fundId);

      await user.click(screen.getByTestId('mock-case-modal-close'));

      expect(screen.queryByTestId('mock-case-modal')).not.toBeInTheDocument();
    });

    it('should also open the edit modal via the row\'s dedicated edit action', async () => {
      const user = userEvent.setup();
      renderWithCase();

      await user.click(screen.getByTestId('edit-action-direct'));

      expect(screen.getByTestId('mock-case-modal')).toBeInTheDocument();
    });

    it('should call onCaseChanged and close the modal when a case edit is saved', async () => {
      const onCaseChangedMock = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderWithCase({ onCaseChanged: onCaseChangedMock });

      await user.click(screen.getByTestId('action-edit'));
      await user.click(screen.getByTestId('mock-case-modal-save'));

      expect(onCaseChangedMock).toHaveBeenCalled();
      expect(screen.queryByTestId('mock-case-modal')).not.toBeInTheDocument();
    });

    it.each([
      {
        fromStatus: BaseContentStatuses.Published,
        expectedInput: CaseStatus.Hidden,
        toastMessage: 'Справу успішно сховано'
      },
      {
        fromStatus: BaseContentStatuses.Hidden,
        expectedInput: CaseStatus.Published,
        toastMessage: 'Справу успішно опубліковано'
      }
    ])(
      'should toggle a $fromStatus case and show the corresponding success toast',
      async ({ fromStatus, expectedInput, toastMessage }) => {
        mockUpdateCase.mockResolvedValueOnce(undefined);
        const onCaseChangedMock = jest.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();
        renderWithCase({ caseOverrides: { status: fromStatus }, onCaseChanged: onCaseChangedMock });

        await user.click(screen.getByTestId('action-toggle-status'));

        expect(mockUpdateCase).toHaveBeenCalledWith({ id: caseItem.id, input: { status: expectedInput } });
        expect(toast.success).toHaveBeenCalledWith(toastMessage);
        expect(onCaseChangedMock).toHaveBeenCalled();
      }
    );

    it.each([
      { rejection: new Error('Не вдалося змінити'), expectedMessage: 'Не вдалося змінити' },
      { rejection: 'boom', expectedMessage: 'Не вдалося змінити статус справи' }
    ])(
      'should show an error toast ($expectedMessage) when toggling status rejects',
      async ({ rejection, expectedMessage }) => {
        mockUpdateCase.mockRejectedValueOnce(rejection);
        const user = userEvent.setup();
        renderWithCase();

        await user.click(screen.getByTestId('action-toggle-status'));

        expect(toast.error).toHaveBeenCalledWith(expectedMessage);
      }
    );

    it('should delete a case, calling onCaseChanged, when confirmed', async () => {
      const onCaseChangedMock = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderWithCase({ onCaseChanged: onCaseChangedMock });

      await user.click(screen.getByTestId('action-delete'));
      expect(
        screen.getByText(new RegExp(`Ви впевнені, що хочете видалити справу «${caseItem.name}»\\?`))
      ).toBeInTheDocument();

      await user.click(screen.getByTestId('mock-delete-confirm'));

      expect(mockDeleteCase).toHaveBeenCalledWith({ id: caseItem.id });
      expect(onCaseChangedMock).toHaveBeenCalled();
    });

    it('should not call onCaseChanged when deleting a case if it is not provided', async () => {
      const user = userEvent.setup();
      renderWithCase();

      await user.click(screen.getByTestId('action-delete'));
      await user.click(screen.getByTestId('mock-delete-confirm'));

      expect(mockDeleteCase).toHaveBeenCalledWith({ id: caseItem.id });
    });

    it.each([
      { scenario: 'succeeds', impl: () => Promise.resolve(), expectToast: 'success' as const },
      { scenario: 'fails', impl: () => Promise.reject(new Error('denied')), expectToast: 'error' as const }
    ])('should show a $expectToast toast when copying the case link $scenario', async ({ impl, expectToast }) => {
      const writeText = setClipboardWriteText(impl);
      const user = userEvent.setup();
      renderWithCase();

      await user.click(screen.getByTestId('action-share'));

      if (expectToast === 'success') {
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining(`/archive/cases?caseId=${caseItem.id}`));
        expect(toast.success).toHaveBeenCalledWith(COPY_LINK_SUCCESS_MESSAGE);
      } else {
        expect(toast.error).toHaveBeenCalledWith(COPY_LINK_ERROR_MESSAGE);
      }

      clearClipboardWriteText();
    });
  });
});
