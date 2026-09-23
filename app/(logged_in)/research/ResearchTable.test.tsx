import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResearchTable } from './ResearchTable';
import { RESEARCH_MENU_ACTIONS } from '~/constants/research';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { ResearchWork } from '~/types/researchWork';

jest.mock('~/shared/components/table-layout/TableLayout', () => ({
  TableLayout: ({
    data
  }: {
    data: Array<{
      id: string;
      plainData: {
        author: string;
        bibliographicDescription: string;
        year: string;
        editAction?: { editLabel: string; onEditClick?: () => void };
        menuActions?: {
          menuItems: Array<{ items: Array<{ id: string; text: { name: string }; onClick: () => void }> }>;
          menuTriggerLabel: string;
        };
      };
    }>;
  }) => (
    <div data-testid="research-table">
      {data.map((row) => (
        <div key={row.id} data-testid={`research-row-${row.id}`}>
          <span>{row.plainData.author}</span>
          <span>{row.plainData.bibliographicDescription}</span>
          <span>{row.plainData.year}</span>
          {row.plainData.editAction?.onEditClick && (
            <button type="button" aria-label={row.plainData.editAction.editLabel} onClick={row.plainData.editAction.onEditClick}>
              edit
            </button>
          )}
          {row.plainData.menuActions && (
            <div>
              <button type="button" aria-label={row.plainData.menuActions.menuTriggerLabel}>
                menu
              </button>
              <ul>
                {row.plainData.menuActions.menuItems.flatMap((group) =>
                  group.items.map((item) => (
                    <li key={item.id}>
                      <button type="button" onClick={item.onClick}>
                        {item.text.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}));

const work: ResearchWork = {
  id: 'work-1',
  author: 'Коваленко Олена',
  bibliographicDescription: 'Коваленко, Олена. Тестовий бібліографічний опис.',
  year: '1970',
  keywords: '',
  status: BaseContentStatuses.Published,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-11T10:00:00.000Z',
  publishedAt: '2025-09-11T10:00:00.000Z'
};

const secondWork: ResearchWork = {
  id: 'work-2',
  author: 'Мельник Андрій',
  bibliographicDescription: 'Мельник, Андрій. Інший тестовий опис.',
  year: '1947',
  keywords: '',
  status: BaseContentStatuses.Hidden,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-10T10:00:00.000Z'
};

describe('ResearchTable', () => {
  it('renders one row per work with author, description and dates', () => {
    render(<ResearchTable works={[work, secondWork]} onEditWork={jest.fn()} />);

    const firstRow = screen.getByTestId('research-row-work-1');
    expect(within(firstRow).getByText(work.author)).toBeInTheDocument();
    expect(within(firstRow).getByText(work.bibliographicDescription)).toBeInTheDocument();
    expect(within(firstRow).getByText(work.year)).toBeInTheDocument();

    expect(screen.getByTestId('research-row-work-2')).toBeInTheDocument();
  });

  it('wraps long free-text dates onto the next line', () => {
    const longDatesWork: ResearchWork = {
      ...work,
      id: 'work-dates',
      year: '1941–1945, бл. 1950, післявоєнний період'
    };

    render(<ResearchTable works={[longDatesWork]} onEditWork={jest.fn()} />);

    expect(
      within(screen.getByTestId('research-row-work-dates')).getByText(longDatesWork.year)
    ).toBeInTheDocument();
  });

  it('renders an empty table when no works are provided', () => {
    render(<ResearchTable works={[]} onEditWork={jest.fn()} />);

    expect(screen.getByTestId('research-table')).toBeEmptyDOMElement();
  });

  it('calls onEditWork when the edit action is clicked', async () => {
    const user = userEvent.setup();
    const onEditWork = jest.fn();

    render(<ResearchTable works={[work]} onEditWork={onEditWork} />);

    await user.click(screen.getByRole('button', { name: `Редагувати роботу ${work.author}` }));

    expect(onEditWork).toHaveBeenCalledWith(work);
  });

  it('offers Hide and Delete for a published work', async () => {
    const user = userEvent.setup();
    const onDeleteWork = jest.fn();
    const onToggleStatus = jest.fn();

    render(
      <ResearchTable
        works={[work]}
        onEditWork={jest.fn()}
        onDeleteWork={onDeleteWork}
        onToggleStatus={onToggleStatus}
      />
    );

    await user.click(screen.getByRole('button', { name: RESEARCH_MENU_ACTIONS.hide }));
    expect(onToggleStatus).toHaveBeenCalledWith(work);

    await user.click(screen.getByRole('button', { name: RESEARCH_MENU_ACTIONS.delete }));
    expect(onDeleteWork).toHaveBeenCalledWith(work);
  });

  it('offers Publish for a hidden work', async () => {
    const user = userEvent.setup();
    const onToggleStatus = jest.fn();

    render(
      <ResearchTable works={[secondWork]} onEditWork={jest.fn()} onToggleStatus={onToggleStatus} />
    );

    await user.click(screen.getByRole('button', { name: RESEARCH_MENU_ACTIONS.publish }));

    expect(onToggleStatus).toHaveBeenCalledWith(secondWork);
  });
});
