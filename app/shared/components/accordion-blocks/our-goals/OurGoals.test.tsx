import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import OurGoals from './OurGoals';
import { GoalItem, hardcodedData } from './OurGoals.const';

jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');

  return {
    __esModule: true,
    ...originalModule,
    debounce: (fn: (newValue: GoalItem) => void) => fn
  };
});

jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="collapsible-block">
      <div>{title}</div>
      {children}
    </div>
  )
}));

jest.mock('../../configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({
    items,
    renderItem,
    onCreate,
    onChange,
    onDelete
  }: {
    items: GoalItem[];
    renderItem: ({ item, onChange }: { item: GoalItem; onChange: (newValue: GoalItem) => void }) => React.ReactNode;
    onCreate: () => GoalItem;
    onChange: (newValue: GoalItem) => void;
    onDelete: (id: GoalItem['id']) => void;
  }) => (
    <div data-testid="configurable-list">
      {items.map((item: GoalItem) => (
        <div key={item.id} data-testid="list-item">
          {renderItem({ item, onChange: (newValue: GoalItem) => onChange(newValue) })}
          <button onClick={() => onDelete(item.id)} data-testid="trash-icon"></button>
        </div>
      ))}
      <button onClick={onCreate}>Додати пункт</button>
    </div>
  )
}));

describe('OurGoals component', () => {
  beforeEach(() => {
    render(<OurGoals />);
  });

  it('should render section title and goals list', () => {
    expect(screen.getByLabelText(/Текст заголовку/i)).toBeInTheDocument();

    const goal = hardcodedData.goals[0];
    expect(screen.getByDisplayValue(goal.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(goal.text)).toBeInTheDocument();
  });

  it('should update section title', () => {
    const sectionTitleInput = screen.getByLabelText(/Текст заголовку/i);

    fireEvent.change(sectionTitleInput, { target: { value: 'Новий заголовок' } });
    expect(sectionTitleInput).toHaveValue('Новий заголовок');
  });

  it('should add a new goal item', () => {
    const addButton = screen.getByRole('button', { name: /Додати пункт/i });
    const goalsCount = hardcodedData.goals.length;

    fireEvent.click(addButton);

    expect(screen.getAllByLabelText(/Заголовок пункту/i)).toHaveLength(goalsCount + 1);
    expect(screen.getAllByLabelText(/Текст пункту/i)).toHaveLength(goalsCount + 1);
  });

  it('should edit a goal item', async () => {
    const firstTitleInput = screen.getAllByLabelText(/Заголовок пункту/i)[0];
    const firstTextInput = screen.getAllByLabelText(/Текст пункту/i)[0];

    fireEvent.change(firstTitleInput, { target: { value: 'Оновлений заголовок' } });
    fireEvent.change(firstTextInput, { target: { value: 'Оновлений текст' } });

    await waitFor(() => {
      expect(firstTitleInput).toHaveValue('Оновлений заголовок');
    });
  });

  it('should delete a goal item', () => {
    const deleteButtons = screen.getAllByTestId('trash-icon');

    const initialCount = deleteButtons.length;
    fireEvent.click(deleteButtons[0]);

    expect(screen.getAllByLabelText(/Заголовок пункту/i).length).toBe(initialCount - 1);
  });
});
