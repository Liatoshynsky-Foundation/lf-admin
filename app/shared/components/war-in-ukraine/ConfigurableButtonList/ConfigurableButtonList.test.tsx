import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ClickableButtonData,ConfigurableButtonList } from './ConfigurableButtonList';

beforeAll(() => {
  if (!global.crypto) {
    global.crypto = {} as Crypto;
  }
  if (!global.crypto.randomUUID) {
    Object.defineProperty(global.crypto, 'randomUUID', {
      value: jest.fn().mockReturnValue('mocked-uuid-1234')
    });
  }
});

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({ items, addBtnLabel, onCreate, onChange, onDelete, renderItem }: any) => (
    <div data-testid="configurable-list">
      <button type="button" data-testid="create-btn" onClick={() => onCreate()}>
        {addBtnLabel}
      </button>
      {items.map((item: any, index: number) => (
        <div key={item.id || index} data-testid={`item-row-${index}`}>
          {renderItem({ item, index })}
          <button
            type="button"
            data-testid={`update-btn-${index}`}
            onClick={() => onChange({ ...item, link: 'https://updated-link.com' })}
          >
            Update
          </button>
          <button
            type="button"
            data-testid={`delete-btn-${index}`}
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('../PrincipleHopeButtonCard/PrincipleHopeButtonCard', () => ({
  PrincipleHopeButtonCard: ({ button }: any) => (
    <div data-testid="button-card">{button.link}</div>
  )
}));

describe('ConfigurableButtonList', () => {
  const mockOnChange = jest.fn();

  const sampleButtons: Partial<ClickableButtonData>[] = [
    {
      id: '1',
      shortText: { uk: 'Тест', en: 'Test' },
      fullText: { uk: 'Повний тест', en: 'Full test' },
      link: 'https://test.com'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, counter and children items correctly', () => {
    render(
      <ConfigurableButtonList
        buttons={sampleButtons}
        currentLocale="uk"
        title="Додаткові кнопки"
        addBtnLabel="Додати кнопку"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Додаткові кнопки (1):')).toBeInTheDocument();
    expect(screen.getByTestId('button-card')).toHaveTextContent('https://test.com');
    expect(screen.getByTestId('create-btn')).toHaveTextContent('Додати кнопку');
  });

  it('normalizes buttons list if fields are missing in raw props', () => {
    const rawIncompleteButtons: any[] = [
      { id: '2', link: 'https://incomplete.com' }
    ];

    render(
      <ConfigurableButtonList
        buttons={rawIncompleteButtons}
        currentLocale="uk"
        title="Кнопки"
        addBtnLabel="Додати"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('button-card')).toHaveTextContent('https://incomplete.com');
  });

  it('normalizes a fully empty button object, generating an id and default fields', () => {
    const emptyButtons: any[] = [{}];

    render(
      <ConfigurableButtonList
        buttons={emptyButtons}
        currentLocale="uk"
        title="Кнопки"
        addBtnLabel="Додати"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('button-card')).toHaveTextContent('');

    fireEvent.click(screen.getByTestId('update-btn-0'));
    const updatedList = mockOnChange.mock.calls[0][0];
    expect(updatedList[0].id).toMatch('btn-0');
    expect(updatedList[0].link).toBe('https://updated-link.com');
  });

  it('calls onChange with a new empty button when create action is triggered', () => {
    render(
      <ConfigurableButtonList
        buttons={sampleButtons}
        currentLocale="uk"
        title="Додаткові кнопки"
        addBtnLabel="Додати кнопку"
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByTestId('create-btn'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedList = mockOnChange.mock.calls[0][0];

    expect(updatedList).toHaveLength(2);
    expect(updatedList[1]).toMatchObject({
      id: 'mocked-uuid-1234',
      shortText: { uk: '', en: '' },
      fullText: { uk: '', en: '' },
      link: ''
    });
  });

  it('calls onChange with updated button when item change is triggered', () => {
    const twoButtons = [
      ...sampleButtons,
      { id: '2', shortText: { uk: 'Т2', en: 'T2' }, fullText: { uk: 'ПТ2', en: 'FT2' }, link: 'https://test2.com' }
    ];

    render(
      <ConfigurableButtonList
        buttons={twoButtons}
        currentLocale="uk"
        title="Додаткові кнопки"
        addBtnLabel="Додати кнопку"
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByTestId('update-btn-0'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedList = mockOnChange.mock.calls[0][0];

    expect(updatedList).toHaveLength(2);
    expect(updatedList[0].link).toBe('https://updated-link.com');
    expect(updatedList[1].id).toBe('2');
  });

  it('calls onChange with filtered list when delete action is triggered', () => {
    const twoButtons = [
      ...sampleButtons,
      { id: '2', shortText: { uk: 'Т2', en: 'T2' }, fullText: { uk: 'ПТ2', en: 'FT2' }, link: 'https://test2.com' }
    ];

    render(
      <ConfigurableButtonList
        buttons={twoButtons}
        currentLocale="uk"
        title="Додаткові кнопки"
        addBtnLabel="Додати кнопку"
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByTestId('delete-btn-0'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const updatedList = mockOnChange.mock.calls[0][0];

    expect(updatedList).toHaveLength(1);
    expect(updatedList[0].id).toBe('2');
  });

  it('renders an empty list correctly with a zero counter', () => {
    render(
      <ConfigurableButtonList
        buttons={[]}
        currentLocale="uk"
        title="Додаткові кнопки"
        addBtnLabel="Додати кнопку"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Додаткові кнопки (0):')).toBeInTheDocument();
    expect(screen.queryByTestId('button-card')).not.toBeInTheDocument();
  });
});
