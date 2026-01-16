import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FilterDropdown } from './FilterDropdown';

jest.mock('~/public/icons/chevronDown.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="chevron-icon" />
}));

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

describe('FilterDropdown', () => {
  it('should render filter dropdown with label', () => {
    render(<FilterDropdown label="Test Filter" value="" options={mockOptions} onChange={() => {}} />);

    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('should apply custom testId', () => {
    render(
      <FilterDropdown label="Test Filter" value="" options={mockOptions} onChange={() => {}} testId="custom-filter" />
    );

    expect(screen.getByTestId('custom-filter')).toBeInTheDocument();
  });

  it('should open menu when clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown label="Test Filter" value="" options={mockOptions} onChange={() => {}} />);

    const button = screen.getByText('Test Filter');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  it('should display all options in menu', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown label="Test Filter" value="" options={mockOptions} onChange={() => {}} />);

    const button = screen.getByText('Test Filter');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  it('should call onChange when option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<FilterDropdown label="Test Filter" value="" options={mockOptions} onChange={handleChange} />);

    const button = screen.getByText('Test Filter');
    await user.click(button);

    const option = await screen.findByText('Option 1');
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('should display selected option as chip', () => {
    render(<FilterDropdown label="Test Filter" value="option2" options={mockOptions} onChange={() => {}} />);

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should show selected value as chip', () => {
    render(<FilterDropdown label="Test Filter" value="option2" options={mockOptions} onChange={() => {}} />);

    expect(screen.getByText('Option 2')).toBeInTheDocument();

    const chip = screen.getByText('Option 2').closest('div');
    expect(chip).toHaveStyle({ backgroundColor: '#FCFCFC' });
  });

  it('should clear selection when chip is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<FilterDropdown label="Test Filter" value="option1" options={mockOptions} onChange={handleChange} />);

    const chip = screen.getByText('Option 1').closest('div');
    expect(chip).toBeInTheDocument();

    if (chip) {
      await user.click(chip);
      expect(handleChange).toHaveBeenCalledWith('');
    }
  });

  it('should close menu after selection', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown label="Test Filter" value="" options={mockOptions} onChange={() => {}} />);

    const button = screen.getByText('Test Filter');
    await user.click(button);

    const option = await screen.findByText('Option 1');
    await user.click(option);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('should handle empty options array', () => {
    render(<FilterDropdown label="Test Filter" value="" options={[]} onChange={() => {}} />);

    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('should render chevron icon', () => {
    render(<FilterDropdown label="Test Filter" value="" options={mockOptions} onChange={() => {}} />);

    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });
});
