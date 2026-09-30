import { fireEvent, render, screen } from '@testing-library/react';

import { ResearchCreateAction } from './ResearchCreateAction';

jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="plus-icon" />
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    startIcon,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    startIcon?: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    color?: string;
  }) => (
    <button type="button" data-testid="mock-button" onClick={onClick} {...props}>
      {startIcon && <span className="start-icon">{startIcon}</span>}
      {children}
    </button>
  )
}));

describe('ResearchCreateAction', () => {
  it('renders the DS filled primary button with label and plus icon', () => {
    render(<ResearchCreateAction onClick={jest.fn()} />);

    const button = screen.getByTestId('mock-button');

    expect(button).toHaveAttribute('variant', 'filled');
    expect(button).toHaveAttribute('color', 'primary');
    expect(button).toHaveTextContent('Додати роботу');
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('calls onClick when the button is pressed', () => {
    const onClick = jest.fn();
    render(<ResearchCreateAction onClick={onClick} />);

    fireEvent.click(screen.getByTestId('mock-button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
