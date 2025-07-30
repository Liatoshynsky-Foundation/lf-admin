import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import BulletPointsSection from './BulletPointsSection';
import { BulletPointsItem, hardcodedData } from './BulletPointsSection.const';

jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');

  return {
    __esModule: true,
    ...originalModule,
    debounce: (fn: (newValue: BulletPointsItem) => void) => fn
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
    items: BulletPointsItem[];
    renderItem: ({
      item,
      onChange
    }: {
      item: BulletPointsItem;
      onChange: (newValue: BulletPointsItem) => void;
    }) => React.ReactNode;
    onCreate: () => BulletPointsItem;
    onChange: (newValue: BulletPointsItem) => void;
    onDelete: (id: BulletPointsItem['id']) => void;
  }) => (
    <div data-testid="configurable-list">
      {items.map((item: BulletPointsItem) => (
        <div key={item.id} data-testid="list-item">
          {renderItem({ item, onChange: (newValue: BulletPointsItem) => onChange(newValue) })}
          <button onClick={() => onDelete(item.id)} data-testid="trash-icon"></button>
        </div>
      ))}
      <button onClick={onCreate}>Додати пункт</button>
    </div>
  )
}));

describe('BulletPoints component', () => {
  beforeEach(() => {
    render(<BulletPointsSection bulletPointsTitle="Наші цілі" defaultSectionTitle="Наша місія" />);
  });

  it('should render section title and bulletPoints list', () => {
    expect(screen.getByLabelText(/Текст заголовку/i)).toBeInTheDocument();

    const bulletPoint = hardcodedData.bulletPoints[0];
    expect(screen.getByDisplayValue(bulletPoint.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(bulletPoint.text)).toBeInTheDocument();
  });

  it('should update section title', () => {
    const sectionTitleInput = screen.getByLabelText(/Текст заголовку/i);

    fireEvent.change(sectionTitleInput, { target: { value: 'Новий заголовок' } });
    expect(sectionTitleInput).toHaveValue('Новий заголовок');
  });

  it('should add a new bulletPoint item', () => {
    const addButton = screen.getByRole('button', { name: /Додати пункт/i });
    const bulletPointsCount = hardcodedData.bulletPoints.length;

    fireEvent.click(addButton);

    expect(screen.getAllByLabelText(/Заголовок пункту/i)).toHaveLength(bulletPointsCount + 1);
    expect(screen.getAllByLabelText(/Текст пункту/i)).toHaveLength(bulletPointsCount + 1);
  });

  it('should edit a bulletPoint item', async () => {
    const firstTitleInput = screen.getAllByLabelText(/Заголовок пункту/i)[0];
    const firstTextInput = screen.getAllByLabelText(/Текст пункту/i)[0];

    fireEvent.change(firstTitleInput, { target: { value: 'Оновлений заголовок' } });
    fireEvent.change(firstTextInput, { target: { value: 'Оновлений текст' } });

    await waitFor(() => {
      expect(firstTitleInput).toHaveValue('Оновлений заголовок');
    });
  });

  it('should delete a bulletPoint item', () => {
    const deleteButtons = screen.getAllByTestId('trash-icon');

    const initialCount = deleteButtons.length;
    fireEvent.click(deleteButtons[0]);

    expect(screen.getAllByLabelText(/Заголовок пункту/i).length).toBe(initialCount - 1);
  });
});
