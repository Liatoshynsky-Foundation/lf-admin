import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchButton } from './SearchButton';

jest.mock('~/public/icons/search.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="search-icon" />
}));

describe('SearchButton', () => {
  it('should render search input', () => {
    render(<SearchButton value="" onSearch={() => {}} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should call onSearch when user types', async () => {
    const user = userEvent.setup();
    const handleSearch = jest.fn();

    render(<SearchButton value="" onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleSearch).toHaveBeenCalled();
  });

  it('should display placeholder when focused', async () => {
    const user = userEvent.setup();
    render(<SearchButton value="" onSearch={() => {}} placeholder="Пошук..." />);

    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('placeholder', '');

    await user.click(input);

    expect(input).toHaveAttribute('placeholder', 'Пошук...');
  });

  it('should apply custom testId', () => {
    render(<SearchButton value="" onSearch={() => {}} testId="custom-search" />);

    expect(screen.getByTestId('custom-search')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SearchButton value="current value" onSearch={() => {}} />);

    expect(screen.getByDisplayValue('current value')).toBeInTheDocument();
  });

  it('should remove placeholder when blurred', async () => {
    const user = userEvent.setup();
    render(<SearchButton value="" onSearch={() => {}} placeholder="Пошук..." />);

    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(input).toHaveAttribute('placeholder', 'Пошук...');

    await user.click(document.body);
    expect(input).toHaveAttribute('placeholder', '');
  });

  it('should focus input when search icon wrapper is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchButton value="" onSearch={() => {}} />);

    const input = screen.getByRole('textbox');
    const iconWrapper = screen.getByTestId('search-icon').parentElement!;

    expect(input).not.toHaveFocus();

    await user.click(iconWrapper);

    expect(input).toHaveFocus();
  });
});
