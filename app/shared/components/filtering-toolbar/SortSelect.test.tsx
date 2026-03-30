import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { SortSelect } from './SortSelect';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />
}));

jest.mock('~/shared/components/dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: ({ open, menuList }: { open: boolean; menuList: React.ReactNode }) =>
    open ? <div data-testid="dropdown-menu">{menuList}</div> : null
}));

jest.mock('~/shared/components/selector/FilterSelectItem/FilterSelectItem', () => ({
  __esModule: true,
  default: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button type="button" data-testid={`sort-option-${label}`} onClick={onClick}>
      {label}
    </button>
  )
}));

describe('SortSelect', () => {
  const fieldOptions = [
    { value: 'date', label: 'Дата додавання' },
    { value: 'name', label: 'Назва файлу' }
  ] as const;

  const orderOptions = {
    date: [
      { value: 'date_desc', label: 'Новіші-старіші' },
      { value: 'date_asc', label: 'Старіші-новіші' }
    ],
    name: [
      { value: 'name_asc', label: 'А-Я' },
      { value: 'name_desc', label: 'Я-А' }
    ]
  } as const;

  it('renders trigger label', () => {
    render(
      <SortSelect
        fieldOptions={fieldOptions}
        orderOptions={orderOptions}
        fieldValue="date"
        value="date_desc"
        triggerLabel="Нові спочатку"
        onFieldChange={jest.fn()}
        onValueChange={jest.fn()}
      />
    );

    expect(screen.getByText('Нові спочатку')).toBeInTheDocument();
  });

  it('calls onFieldChange when a field option is selected', () => {
    const onFieldChange = jest.fn();

    render(
      <SortSelect
        fieldOptions={fieldOptions}
        orderOptions={orderOptions}
        fieldValue="date"
        value="date_desc"
        triggerLabel="Нові спочатку"
        onFieldChange={onFieldChange}
        onValueChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('sort-select'));
    fireEvent.click(screen.getByTestId('sort-option-Назва файлу'));

    expect(onFieldChange).toHaveBeenCalledWith('name');
  });

  it('calls onValueChange when an order option is selected', () => {
    const onValueChange = jest.fn();

    render(
      <SortSelect
        fieldOptions={fieldOptions}
        orderOptions={orderOptions}
        fieldValue="name"
        value="name_desc"
        triggerLabel="Я-А"
        onFieldChange={jest.fn()}
        onValueChange={onValueChange}
      />
    );

    fireEvent.click(screen.getByTestId('sort-select'));
    fireEvent.click(screen.getByTestId('sort-option-А-Я'));

    expect(onValueChange).toHaveBeenCalledWith('name_asc');
  });
});