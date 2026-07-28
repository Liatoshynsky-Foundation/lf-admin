import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import TooltipCustom from './Tooltip';

describe('TooltipCustom Component', () => {
  test('renders the button with tooltip', () => {
    render(<TooltipCustom showArrow={false} text="My Tooltip" />);
    const buttonElement = screen.getByText(/My Tooltip/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders tooltip with arrow when showArrow is true', async () => {
    render(<TooltipCustom showArrow={true} text="My Tooltip with Arrow" />);
    const buttonElement = screen.getByText(/My Tooltip with Arrow/i);
    fireEvent.mouseOver(buttonElement);
    const tooltipElement = await screen.findByText(/My Tooltip with Arrow/i);
    expect(tooltipElement).toBeVisible();
  });

  test('renders tooltip without arrow when showArrow is false', async () => {
    render(<TooltipCustom showArrow={false} text="My Tooltip" />);
    const buttonElement = screen.getByText(/My Tooltip/i);
    fireEvent.mouseOver(buttonElement);
    const tooltipElement = await screen.findByText(/My Tooltip/i);
    expect(tooltipElement).toBeVisible();
  });

  test('renders controlled tooltip when isOpen prop is provided', () => {
    render(<TooltipCustom title="Controlled Tooltip" isOpen={true} />);
    expect(screen.getAllByText('Controlled Tooltip')[0]).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  test('fallbacks to empty string title when title and text are omitted', () => {
    const { container } = render(<TooltipCustom />);
    expect(container).toBeInTheDocument();
  });

  test('renders with custom title, children, and arrow prop', () => {
    render(
      <TooltipCustom title="Custom Title" arrow={true}>
        <span>Custom Child</span>
      </TooltipCustom>
    );
    expect(screen.getByText('Custom Child')).toBeInTheDocument();
  });
});
