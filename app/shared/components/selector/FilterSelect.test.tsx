import { fireEvent, render, screen } from '@testing-library/react';

import { FilterSelect } from './FilterSelect';

const mockOptions = [
  { label: 'First', value: 'first' },
  { label: 'Second', value: 'second' },
  { label: 'Third', value: 'third' }
];

jest.mock('~/public/icons/close.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="clear-all-icon" />
}));

describe('FilterSelect', () => {
  it('should render the label', () => {
    render(<FilterSelect label="Test Label" options={mockOptions} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', () => {
    render(<FilterSelect label="Dropdown" options={mockOptions} />);

    fireEvent.click(screen.getByText('Dropdown'));

    mockOptions.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should call onAdd when item is selected', () => {
    const onAdd = jest.fn();

    render(<FilterSelect label="Select" options={mockOptions} onAdd={onAdd} />);

    fireEvent.click(screen.getByText('Select'));
    fireEvent.click(screen.getByText('Second'));

    expect(onAdd).toHaveBeenCalledWith('second', 'Second', ['second']);
  });

  it('should clear selected item and call onRemove', () => {
    const onRemove = jest.fn();

    render(<FilterSelect label="Remove" options={mockOptions} defaultValues={['first']} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole('button', { name: /chevron-down/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Очистити' }));

    expect(onRemove).toHaveBeenCalledWith('first', 'First', []);
    expect(screen.queryByTestId('clear-all-icon')).not.toBeInTheDocument();
  });

  it('should not open menu if disabled', () => {
    render(<FilterSelect label="Disabled" options={mockOptions} disabled />);

    fireEvent.click(screen.getByText('Disabled'));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
