import { fireEvent, render, screen } from '@testing-library/react';

import FilterSelectItem from './FilterSelectItem';

jest.mock('~/public/icons/checkmark.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="checkmark-icon" />
}));

const label = 'Test Label';
const handleClick = jest.fn();

describe('FilterSelectItem', () => {
  it('should render the label', () => {
    render(<FilterSelectItem label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('should not render selected icon when item is not selected', () => {
    render(<FilterSelectItem label={label} />);
    expect(screen.queryByTestId('checkmark-icon')).not.toBeInTheDocument();
  });

  it('should call onClick when the Box is clicked', () => {
    render(<FilterSelectItem label={label} onClick={handleClick} />);
    fireEvent.click(screen.getByText(label));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render selected icon when selected is true', () => {
    render(<FilterSelectItem label={label} selected />);
    expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
  });

  it('should render when disabled is true', () => {
    render(<FilterSelectItem label={label} disabled />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});