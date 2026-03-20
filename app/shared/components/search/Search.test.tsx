import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useState } from 'react';

import { Search, type SearchOption } from './Search';

describe('Search', () => {
  const options: SearchOption[] = [
    { id: '1', title: 'Test Song' },
    { id: '2', title: 'Another Song' }
  ];

  type SearchHarnessProps = Readonly<{
    opts?: SearchOption[];
    initialSearch?: string;
    onSetSearch?: (value: string) => void;
  }>;

  function SearchHarness({ opts = options, initialSearch = '', onSetSearch }: SearchHarnessProps) {
    const [value, setValue] = useState(initialSearch);

    const handleSetSearch = (nextValue: string) => {
      setValue(nextValue);
      onSetSearch?.(nextValue);
    };

    return <Search search={value} setSearch={handleSetSearch} options={opts} />;
  }

  const renderSearch = (opts = options, initialSearch = '', onSetSearch = jest.fn()) => {
    render(<SearchHarness opts={opts} initialSearch={initialSearch} onSetSearch={onSetSearch} />);
    const input = screen.getByRole('combobox');
    return { onSetSearch, input };
  };

  it('should render the search input', () => {
    renderSearch();

    expect(screen.getByPlaceholderText('Пошук')).toBeInTheDocument();
  });

  it('should call setSearch on input change', async () => {
    const { onSetSearch, input } = renderSearch();

    fireEvent.change(input, { target: { value: 'Bohemian' } });

    await waitFor(() => {
      expect(onSetSearch).toHaveBeenCalledWith('Bohemian');
    });
  });

  it('should render filtered options', async () => {
    const { input } = renderSearch();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    expect(screen.queryByText('Another Song')).not.toBeInTheDocument();
  });

  it('should call setSearch when option is selected', async () => {
    const { onSetSearch, input } = renderSearch();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Test' } });

    const option = await screen.findByText('Test Song');
    fireEvent.click(option);

    expect(onSetSearch).toHaveBeenCalledWith('Test Song');
  });

  it('should clear search on clear button click', async () => {
    const onSetSearch = jest.fn();
    renderSearch(options, 'Test Song', onSetSearch);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSetSearch).toHaveBeenCalledWith('');
    });
  });
});
