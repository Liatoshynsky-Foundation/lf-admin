import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';

import { useArchiveCaseRowActions } from './useArchiveCaseRowActions';
import type { ArchiveCase } from '~/(logged_in)/archive/(components)/archive-funds-table/ArchiveFundsTable';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

const mockDeleteCase = jest.fn();
const mockUpdateCase = jest.fn();
jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  useDeleteCase: () => [mockDeleteCase],
  useUpdateCase: () => [mockUpdateCase],
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('~/shared/components/delete-composition-modal/DeleteCompositionModal', () => ({
  DeleteCompositionModal: (props: { open: boolean; onClose: () => void; onConfirm: () => void; description: string }) => (
    <div data-testid="mock-delete-modal" data-open={props.open}>
      <span>{props.description}</span>
      <button onClick={props.onClose} data-testid="mock-delete-close">Close</button>
      <button onClick={props.onConfirm} data-testid="mock-delete-confirm">Confirm</button>
    </div>
  )
}));

jest.mock('~/(logged_in)/archive/(components)/ArchiveCaseModal', () => ({
  ArchiveCaseModal: (props: {
    fundId: string;
    caseId: string;
    setIsOpen: (open: boolean) => void;
    onSaved: () => Promise<unknown>;
  }) => (
    <div data-testid="mock-edit-case-modal">
      <span data-testid="edit-case-fund-id">{props.fundId}</span>
      <span data-testid="edit-case-case-id">{props.caseId}</span>
      <button data-testid="edit-case-close" onClick={() => props.setIsOpen(false)}>Close</button>
      <button data-testid="edit-case-save" onClick={props.onSaved}>Save</button>
    </div>
  ),
}));

const buildCase = (overrides?: Partial<ArchiveCase>): ArchiveCase => ({
  id: 'case-1',
  name: 'Справа 1',
  fundId: 'fund-1',
  cipher: '1-1-1',
  caseNumber: 3,
  descriptionNumber: 2,
  sheetsNumber: 5,
  editCaseDate: '1995',
  editCaseDescriptions: 'опис справи',
  detailedCaseDescription: 'детальний опис',
  status: BaseContentStatuses.Published,
  updatedAt: '2023-01-01',
  ...overrides,
});

const TestHarness = ({
  caseItem,
  onCaseChanged,
}: {
  caseItem: ArchiveCase;
  onCaseChanged?: () => Promise<unknown>;
}) => {
  const { getCaseRow, caseRowModals } = useArchiveCaseRowActions(onCaseChanged);
  const row = getCaseRow(caseItem);
  const shareItem = row.menuActions.menuItems[0].items.find((item) => item.id === 'share');

  return (
    <div>
      <div data-testid="row-json">
        {JSON.stringify({
          id: row.id,
          name: row.name,
          descriptionLabel: row.descriptionLabel,
          caseLabel: row.caseLabel,
          caseDate: row.caseDate,
          cipher: row.cipher,
          status: row.status,
          updatedAt: row.updatedAt,
          editLabel: row.editAction.editLabel,
          menuTriggerLabel: row.menuActions.menuTriggerLabel,
        })}
      </div>
      <span data-testid="share-href">{shareItem?.href}</span>
      <button data-testid="edit-action" onClick={row.editAction.onEditClick}>edit-action</button>
      {row.menuActions.menuItems.flatMap((group) => group.items).map((item) => (
        <button key={item.id} data-testid={`menu-${item.id}`} onClick={item.onClick}>
          {item.text.name}
        </button>
      ))}
      {caseRowModals}
    </div>
  );
};

describe('useArchiveCaseRowActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should map an ArchiveCase into the expected row fields', () => {
    const caseItem = buildCase();
    render(<TestHarness caseItem={caseItem} />);

    expect(screen.getByTestId('row-json')).toHaveTextContent(JSON.stringify({
      id: caseItem.id,
      name: caseItem.name,
      descriptionLabel: `оп. ${caseItem.descriptionNumber}`,
      caseLabel: `спр. ${caseItem.caseNumber}`,
      caseDate: caseItem.editCaseDate,
      cipher: caseItem.cipher,
      status: caseItem.status,
      updatedAt: caseItem.updatedAt,
      editLabel: `Редагувати справу ${caseItem.name}`,
      menuTriggerLabel: `Дії для справи ${caseItem.name}`,
    }));
    expect(screen.getByTestId('share-href')).toHaveTextContent(`/archive/case/${caseItem.id}/share`);
  });

  describe('Edit Case Flow', () => {
    it.each([
      { triggerTestId: 'edit-action', trigger: 'the edit action link' },
      { triggerTestId: 'menu-edit', trigger: 'the edit menu item' },
    ])('should open the edit modal with the case data when clicking $trigger', async ({ triggerTestId }) => {
      const user = userEvent.setup();
      const caseItem = buildCase();
      render(<TestHarness caseItem={caseItem} />);

      expect(screen.queryByTestId('mock-edit-case-modal')).not.toBeInTheDocument();

      await user.click(screen.getByTestId(triggerTestId));

      expect(screen.getByTestId('mock-edit-case-modal')).toBeInTheDocument();
      expect(screen.getByTestId('edit-case-fund-id')).toHaveTextContent(caseItem.fundId);
      expect(screen.getByTestId('edit-case-case-id')).toHaveTextContent(caseItem.id);
    });

    it('should close the edit modal without calling onCaseChanged', async () => {
      const user = userEvent.setup();
      const onCaseChangedMock = jest.fn();
      render(<TestHarness caseItem={buildCase()} onCaseChanged={onCaseChangedMock} />);

      await user.click(screen.getByTestId('edit-action'));
      await user.click(screen.getByTestId('edit-case-close'));

      expect(screen.queryByTestId('mock-edit-case-modal')).not.toBeInTheDocument();
      expect(onCaseChangedMock).not.toHaveBeenCalled();
    });

    it('should close the edit modal and call onCaseChanged when the edit is saved', async () => {
      const user = userEvent.setup();
      const onCaseChangedMock = jest.fn();
      render(<TestHarness caseItem={buildCase()} onCaseChanged={onCaseChangedMock} />);

      await user.click(screen.getByTestId('edit-action'));
      await user.click(screen.getByTestId('edit-case-save'));

      expect(screen.queryByTestId('mock-edit-case-modal')).not.toBeInTheDocument();
      expect(onCaseChangedMock).toHaveBeenCalled();
    });

    it('should not call onCaseChanged after saving when it is not provided', async () => {
      const user = userEvent.setup();
      render(<TestHarness caseItem={buildCase()} />);

      await user.click(screen.getByTestId('edit-action'));
      await user.click(screen.getByTestId('edit-case-save'));

      expect(screen.queryByTestId('mock-edit-case-modal')).not.toBeInTheDocument();
    });
  });

  describe('Delete Case Flow', () => {
    it('should handle opening the delete modal, closing it, and confirming deletion', async () => {
      const user = userEvent.setup();
      const onCaseChangedMock = jest.fn();
      const caseItem = buildCase();
      render(<TestHarness caseItem={caseItem} onCaseChanged={onCaseChangedMock} />);

      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteCase).not.toHaveBeenCalled();

      await user.click(screen.getByTestId('menu-delete'));
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'true');
      expect(screen.getByText(new RegExp(`Ви впевнені, що хочете видалити справу «${caseItem.name}»\\?`))).toBeInTheDocument();

      await user.click(screen.getByTestId('mock-delete-close'));
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');

      await user.click(screen.getByTestId('menu-delete'));
      await user.click(screen.getByTestId('mock-delete-confirm'));
      expect(mockDeleteCase).toHaveBeenCalledWith({ id: caseItem.id });
      expect(onCaseChangedMock).toHaveBeenCalled();
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');
    });

    it('should not call onCaseChanged after deletion when it is not provided', async () => {
      const user = userEvent.setup();
      render(<TestHarness caseItem={buildCase()} />);

      await user.click(screen.getByTestId('menu-delete'));
      await user.click(screen.getByTestId('mock-delete-confirm'));

      expect(mockDeleteCase).toHaveBeenCalledWith({ id: 'case-1' });
      expect(screen.getByTestId('mock-delete-modal')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Toggle Status Flow', () => {
    it.each([
      {
        status: BaseContentStatuses.Published,
        expectedLabel: 'Сховати',
        expectedInput: CaseStatus.Draft,
        successMessage: 'Справу успішно сховано',
      },
      {
        status: BaseContentStatuses.Hidden,
        expectedLabel: 'Опублікувати',
        expectedInput: CaseStatus.Published,
        successMessage: 'Справу успішно опубліковано',
      },
    ])('should toggle status from $status, label it "$expectedLabel" and toast on success', async ({ status, expectedLabel, expectedInput, successMessage }) => {
      const user = userEvent.setup();
      const onCaseChangedMock = jest.fn();
      const caseItem = buildCase({ status });
      mockUpdateCase.mockResolvedValueOnce(undefined);
      render(<TestHarness caseItem={caseItem} onCaseChanged={onCaseChangedMock} />);

      expect(screen.getByTestId('menu-toggle-status')).toHaveTextContent(expectedLabel);

      await user.click(screen.getByTestId('menu-toggle-status'));

      expect(mockUpdateCase).toHaveBeenCalledWith({ id: caseItem.id, input: { status: expectedInput } });
      expect(toast.success).toHaveBeenCalledWith(successMessage);
      expect(onCaseChangedMock).toHaveBeenCalled();
    });

    it('should not call onCaseChanged after a successful toggle when it is not provided', async () => {
      const user = userEvent.setup();
      mockUpdateCase.mockResolvedValueOnce(undefined);
      render(<TestHarness caseItem={buildCase()} />);

      await user.click(screen.getByTestId('menu-toggle-status'));

      expect(mockUpdateCase).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it.each([
      { rejection: new Error('Мережева помилка'), expectedMessage: 'Мережева помилка' },
      { rejection: 'нетипова відмова', expectedMessage: 'Не вдалося змінити статус справи' },
    ])('should show an error toast when the update fails ($expectedMessage)', async ({ rejection, expectedMessage }) => {
      const user = userEvent.setup();
      const onCaseChangedMock = jest.fn();
      mockUpdateCase.mockRejectedValueOnce(rejection);
      render(<TestHarness caseItem={buildCase()} onCaseChanged={onCaseChangedMock} />);

      await user.click(screen.getByTestId('menu-toggle-status'));

      expect(await screen.findByTestId('menu-toggle-status')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith(expectedMessage);
      expect(toast.success).not.toHaveBeenCalled();
      expect(onCaseChangedMock).not.toHaveBeenCalled();
    });
  });
});