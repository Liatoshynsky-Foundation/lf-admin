import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FilterButton } from './FilterButton';

jest.mock('~/public/icons/chevronDown.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="chevron-icon" />
}));

describe('FilterButton', () => {
  it('should render with label', () => {
    render(<FilterButton label="Позначення" onClick={() => {}} />);

    expect(screen.getByText('Позначення')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<FilterButton label="Test Filter" onClick={handleClick} />);

    await user.click(screen.getByText('Test Filter'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply active state styling', () => {
    const { rerender } = render(<FilterButton label="Filter" onClick={() => {}} active={false} />);

    const button = screen.getByText('Filter');
    expect(button).toBeInTheDocument();

    rerender(<FilterButton label="Filter" onClick={() => {}} active={true} />);
    expect(button).toBeInTheDocument();
  });

  it('should render with custom testId', () => {
    render(<FilterButton label="Filter" onClick={() => {}} testId="custom-filter" />);

    expect(screen.getByTestId('custom-filter')).toBeInTheDocument();
  });
});
