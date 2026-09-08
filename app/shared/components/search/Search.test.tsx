import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    onEnter?: () => void;
  }>;

  function SearchHarness({ opts = options, initialSearch = '', onSetSearch, onEnter }: SearchHarnessProps) {
    const [value, setValue] = useState(initialSearch);

    const handleSetSearch = (nextValue: string) => {
      setValue(nextValue);
      onSetSearch?.(nextValue);
    };

    return <Search search={value} setSearch={handleSetSearch} options={opts} onEnter={onEnter} />;
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

  it('should call setSearch with title when a valid option is selected via keyboard', async () => {
    const { onSetSearch, input } = renderSearch();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Test' } });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onSetSearch).toHaveBeenCalledWith('Test Song');
    });
  });

  describe('onEnter', () => {
    const onEnter = jest.fn();

    beforeEach(() => {
      onEnter.mockClear();
    });

    it('should call onEnter when the Enter key is pressed', () => {
      render(<SearchHarness onEnter={onEnter} />);

      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('should not call onEnter for other keys', () => {
      render(<SearchHarness onEnter={onEnter} />);

      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'a' });

      expect(onEnter).not.toHaveBeenCalled();
    });
  });

  it('should call setSearch with string value when freeSolo input is submitted', async () => {
    const { onSetSearch, input } = renderSearch();
    fireEvent.change(input, { target: { value: 'Custom Text' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onSetSearch).toHaveBeenCalledWith('Custom Text');
    });
  });

  it('should handle sorting by index of match and localeCompare', async () => {
    const complexOptions: SearchOption[] = [
      { id: '1', title: 'Banana' },
      { id: '2', title: 'Apple' },
      { id: '3', title: 'Fruit Apple' },
      { id: '4', title: 'Green Apple' }
    ];

    const { input } = renderSearch(complexOptions);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Apple' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const items = within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent);

      expect(items[0]).toBe('Apple');
      expect(items[1]).toBe('Fruit Apple');
      expect(items[2]).toBe('Green Apple');
    });
  });

  it('should sort alphabetically when index of match is the same', async () => {
    const alphaOptions: SearchOption[] = [
      { id: '1', title: 'ZZ Test' },
      { id: '2', title: 'AA Test' }
    ];

    const { input } = renderSearch(alphaOptions);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const items = within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent);
      expect(items).toEqual(['AA Test', 'ZZ Test']);
    });
  });

  it('should clear search on clear button click', async () => {
    const onSetSearch = jest.fn();
    renderSearch(options, 'Test Song', onSetSearch);

    const clearButton = screen.getByRole('button', { name: 'Очистити пошук' });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(onSetSearch).toHaveBeenCalledWith('');
    });
  });

  it('should handle null value in onChange', async () => {
    const onSetSearch = jest.fn();
    const { input } = renderSearch(options, 'Test Song', onSetSearch);

    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(onSetSearch).toHaveBeenCalledWith('');
    });
  });

  it('should correctly filter with empty search or spaces', async () => {
    const { input } = renderSearch(options);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '   ' } });

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Another Song')).toBeInTheDocument();
    });
  });

  it('should rank exact match first when it is the second item in the list', async () => {
    const opts: SearchOption[] = [
      { id: '1', title: 'Green Apple' },
      { id: '2', title: 'apple' }
    ];
    const { input } = renderSearch(opts);

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'apple' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const items = within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent);
      expect(items[0]).toBe('apple');
    });
  });

  it('should rank "starts with" matches above "contains" matches when second item starts with input', async () => {
    const opts: SearchOption[] = [
      { id: '1', title: 'Pineapple' },
      { id: '2', title: 'Apple Pie' }
    ];
    const { input } = renderSearch(opts);

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'app' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const items = within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent);
      expect(items[0]).toBe('Apple Pie');
    });
  });

  it('should sort by earlier index position when both items contain the match but do not start with it', async () => {
    const opts: SearchOption[] = [
      { id: '1', title: 'A very big cat' },
      { id: '2', title: 'My cat' }
    ];
    const { input } = renderSearch(opts);

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'cat' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const items = within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent);
      expect(items[0]).toBe('My cat');
    });
  });

  it('should return 1 in sort when only the second element starts with the trimmed input', async () => {
    const opts: SearchOption[] = [
      { id: '1', title: 'I have an apple' },
      { id: '2', title: 'apple juice' }
    ];
    const { input } = renderSearch(opts);

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'apple' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const items = within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent);

      expect(items[0]).toBe('apple juice');
      expect(items[1]).toBe('I have an apple');
    });
  });
});
