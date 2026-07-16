import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import FilterSelectItem from './FilterSelectItem';

jest.mock('lucide-react', () => ({
  Check: (props: React.ComponentProps<'svg'>) => <svg data-testid="check-icon" {...props} />
}));

const label = 'Test Label';
const handleClick = jest.fn();

const colors = {
  primary: 'rgb(0, 0, 255)',
  secondary: 'rgb(255, 0, 0)'
};

describe('FilterSelectItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the label', () => {
    render(<FilterSelectItem label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('should not render selected icon when item is not selected', () => {
    render(<FilterSelectItem label={label} />);
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
  });

  it('should call onClick when the Box is clicked', () => {
    render(<FilterSelectItem label={label} onClick={handleClick} />);
    fireEvent.click(screen.getByText(label));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render selected icon when selected is true', () => {
    render(<FilterSelectItem label={label} selected />);
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('should render when disabled is true', () => {
    render(<FilterSelectItem label={label} disabled />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('should correctly handle sx prop when it is a single object', () => {
    const customSx = { color: colors.secondary };
    render(<FilterSelectItem label={label} sx={customSx} />);

    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toHaveStyle(`color: ${colors.secondary}`);
  });

  it('should correctly handle sx prop when it is an array of objects', () => {
    const customSxArray = [{ color: colors.primary }, { backgroundColor: colors.secondary }];
    render(<FilterSelectItem label={label} sx={customSxArray} />);

    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toHaveStyle(`color: ${colors.primary}`);
    expect(menuItem).toHaveStyle(`background-color: ${colors.secondary}`);
  });

  it('should pass additional MenuItemProps down to the MenuItem element via ...props', () => {
    render(<FilterSelectItem label={label} data-custom-attribute="test-value" id="unique-item-id" />);

    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toHaveAttribute('data-custom-attribute', 'test-value');
    expect(menuItem).toHaveAttribute('id', 'unique-item-id');
  });
});
