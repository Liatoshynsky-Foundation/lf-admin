import { fireEvent, render, screen } from '@testing-library/react';

import Alert from './Alert';

describe('Alert Component', () => {
  it('should render alert with default props', () => {
    render(<Alert />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('should render outlined variant', () => {
    render(<Alert variant="outlined" />);
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-outlined');
  });

  it('should display title and description', () => {
    render(<Alert title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should trigger onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(<Alert onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Close alert'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should display custom close label', () => {
    render(<Alert label="Dismiss" onClose={jest.fn()} />);
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('should display correct icon for severity', () => {
    const { rerender } = render(<Alert severity="error" />);
    expect(screen.getByTestId('ErrorOutlineIcon')).toBeInTheDocument();

    rerender(<Alert severity="warning" />);
    expect(screen.getByTestId('WarningAmberRoundedIcon')).toBeInTheDocument();
  });

  it('should render close button with different variants and fallbacks', () => {
    const { rerender } = render(<Alert onClose={jest.fn()} variant="outlined" label="Close" />);
    expect(screen.getByText('Close')).toBeInTheDocument();

    rerender(
      <Alert
        onClose={jest.fn()}
        label="Close"
        slotProps={{
          closeButton: { variant: undefined } as React.ComponentProps<typeof Alert>
        }}
      />
    );
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should render close button with different variants', () => {
    const { rerender } = render(<Alert onClose={jest.fn()} variant="filled" label="Close" />);
    expect(screen.getByText('Close')).toBeInTheDocument();

    rerender(<Alert onClose={jest.fn()} variant="outlined" label="Close" />);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
