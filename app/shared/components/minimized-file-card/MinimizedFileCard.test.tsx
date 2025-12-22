import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MinimizedFileCard from './MinimizedFileCard';

describe('MinimizedFileCard', () => {
  const defaultProps = {
    name: 'Test File',
    date: '10.10.2025'
  };

  it('should render component with required props and default file type', () => {
    render(<MinimizedFileCard {...defaultProps} />);

    expect(screen.getByText('Test File')).toBeInTheDocument();
    expect(screen.getByText('10.10.2025')).toBeInTheDocument();
    expect(screen.getByAltText('img file icon')).toBeInTheDocument();
  });

  it('should render audio icon when fileType is audio', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="audio" />);

    expect(screen.getByAltText('audio file icon')).toBeInTheDocument();
  });

  it('should render pdf icon when fileType is pdf', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="pdf" />);

    expect(screen.getByAltText('pdf file icon')).toBeInTheDocument();
  });

  it('should render star icon when starred prop is true', () => {
    render(<MinimizedFileCard {...defaultProps} starred={true} />);

    expect(screen.getByAltText('Starred file')).toBeInTheDocument();
  });

  it('should not render star icon when starred prop is false', () => {
    render(<MinimizedFileCard {...defaultProps} starred={false} />);

    expect(screen.queryByAltText('Starred file')).not.toBeInTheDocument();
  });

  it('should render link icon when linked prop is true', () => {
    render(<MinimizedFileCard {...defaultProps} linked={true} />);

    expect(screen.getByAltText('Linked file')).toBeInTheDocument();
  });

  it('should not render link icon when linked prop is false', () => {
    render(<MinimizedFileCard {...defaultProps} linked={false} />);

    expect(screen.queryByAltText('Linked file')).not.toBeInTheDocument();
  });

  it('should call onClick handler when the card is clicked', async () => {
    const handleClick = jest.fn();
    render(<MinimizedFileCard {...defaultProps} onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button', { hidden: true }).closest('div')!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onMenuClick handler when the menu button is clicked', async () => {
    const handleMenuClick = jest.fn();
    render(<MinimizedFileCard {...defaultProps} onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByLabelText('Open file menu');
    await userEvent.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should stop propagation and not call onClick when menu button is clicked', async () => {
    const handleClick = jest.fn();
    const handleMenuClick = jest.fn();

    render(<MinimizedFileCard {...defaultProps} onClick={handleClick} onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByLabelText('Open file menu');
    await userEvent.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
