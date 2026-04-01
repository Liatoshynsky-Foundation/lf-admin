import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FilteringToolbar } from './FilteringToolbar';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />
}));

jest.mock('~/shared/components/search/Search', () => ({
  Search: ({ search, setSearch }: { search: string; setSearch: (value: string) => void }) => (
    <input data-testid="search" value={search} onChange={(event) => setSearch(event.target.value)} />
  )
}));

jest.mock('~/shared/components/selector/FilterSelect', () => ({
  FilterSelect: ({
    label,
    options,
    onChange,
    value = []
  }: {
    label: string;
    options: Array<{ value: string; label: string }>;
    onChange?: (value: string[]) => void;
    value?: string[];
  }) => (
    <button
      type="button"
      data-testid={`filter-select-${label}`}
      onClick={() => onChange?.([...value, options[0].value])}
    >
      {label}
    </button>
  )
}));

describe('FilteringToolbar', () => {
  it('renders without right slot', () => {
    render(
      <FilteringToolbar
        dataTestId="filtering-toolbar"
        search={{ search: '', setSearch: jest.fn(), options: [] }}
      />
    );

    expect(screen.getByTestId('filtering-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Фільтри/i })).not.toBeInTheDocument();
  });

  it('renders search, filter toggle and right slot', () => {
    render(
      <FilteringToolbar
        dataTestId="filtering-toolbar"
        search={{ search: '', setSearch: jest.fn(), options: [] }}
        filters={[
          {
            id: 'format',
            label: 'Формат',
            options: [{ value: 'jpg', label: 'JPG' }],
            value: [],
            onChange: jest.fn()
          }
        ]}
        isFiltersOpen={false}
        onToggleFilters={jest.fn()}
        rightSlot={<div data-testid="right-slot">slot</div>}
      />
    );

    expect(screen.getByTestId('filtering-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Фільтри/i })).toBeInTheDocument();
    expect(screen.getByTestId('right-slot')).toBeInTheDocument();
  });

  it('calls search setter and filter toggle callbacks', () => {
    const setSearch = jest.fn();
    const onToggleFilters = jest.fn();

    render(
      <FilteringToolbar
        search={{ search: '', setSearch, options: [] }}
        filters={[
          {
            id: 'format',
            label: 'Формат',
            options: [{ value: 'jpg', label: 'JPG' }],
            value: [],
            onChange: jest.fn()
          }
        ]}
        isFiltersOpen={false}
        onToggleFilters={onToggleFilters}
      />
    );

    fireEvent.change(screen.getByTestId('search'), { target: { value: 'score' } });
    fireEvent.click(screen.getByRole('button', { name: /Фільтри/i }));

    expect(setSearch).toHaveBeenCalledWith('score');
    expect(onToggleFilters).toHaveBeenCalled();
  });

  it('renders bottom content and clears filters', () => {
    const onChange = jest.fn();
    const onClearFilters = jest.fn();

    render(
      <FilteringToolbar
        search={{ search: '', setSearch: jest.fn(), options: [] }}
        filters={[
          {
            id: 'format',
            label: 'Формат',
            options: [{ value: 'jpg', label: 'JPG' }],
            value: ['jpg'],
            onChange
          }
        ]}
        isFiltersOpen
        onToggleFilters={jest.fn()}
        activeFiltersCount={1}
        onClearFilters={onClearFilters}
        bottomTrailingContent={<div data-testid="sort-slot">sort</div>}
      />
    );

    fireEvent.click(screen.getByTestId('filter-select-Формат'));
    fireEvent.click(screen.getByLabelText('clear-filters'));

    expect(onChange).toHaveBeenCalledWith(['jpg', 'jpg']);
    expect(onClearFilters).toHaveBeenCalled();
    expect(screen.getByTestId('sort-slot')).toBeInTheDocument();
  });
});