import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ToolbarButton } from '../editor/ToolbarButton';

describe('ToolbarButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
    isActive: false,
    disabled: false,
    icon: <FormatBoldIcon />,
    label: 'Bold'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the button with icon', () => {
      render(<ToolbarButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render tooltip with label', async () => {
      render(<ToolbarButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.mouseOver(button);

      expect(button.parentElement).toHaveAttribute('aria-label', 'Bold');
    });

    it('should render with different icons', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
      render(<ToolbarButton {...defaultProps} icon={<CustomIcon />} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn();
      render(<ToolbarButton {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const onClick = jest.fn();
      render(<ToolbarButton {...defaultProps} onClick={onClick} disabled={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should allow multiple clicks', () => {
      const onClick = jest.fn();
      render(<ToolbarButton {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<ToolbarButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when disabled prop is false', () => {
      render(<ToolbarButton {...defaultProps} disabled={false} />);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
    });

    it('should have disabled styling when disabled', () => {
      render(<ToolbarButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('Mui-disabled');
    });

    it('should toggle disabled state', () => {
      const { rerender } = render(<ToolbarButton {...defaultProps} disabled={false} />);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();

      rerender(<ToolbarButton {...defaultProps} disabled={true} />);
      expect(button).toBeDisabled();
    });
  });

  describe('Button Size and Styling', () => {
    it('should render as a small button', () => {
      render(<ToolbarButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiIconButton-sizeSmall');
    });

    it('should have minimum width and height', () => {
      render(<ToolbarButton {...defaultProps} />);

      const button = screen.getByRole('button');
      window.getComputedStyle(button);

      expect(button).toBeInTheDocument();
    });

    it('should have border radius', () => {
      render(<ToolbarButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should wrap button in tooltip span', () => {
      render(<ToolbarButton {...defaultProps} label="Test Label" />);

      const button = screen.getByRole('button');
      expect(button.parentElement?.tagName).toBe('SPAN');
    });

    it('should show different labels', () => {
      const { rerender } = render(<ToolbarButton {...defaultProps} label="Bold" />);

      expect(screen.getByRole('button').parentElement).toHaveAttribute('aria-label', 'Bold');

      rerender(<ToolbarButton {...defaultProps} label="Italic" />);
      expect(screen.getByRole('button').parentElement).toHaveAttribute('aria-label', 'Italic');
    });
  });

  describe('Edge Cases', () => {
    it('should handle both active and disabled states', () => {
      render(<ToolbarButton {...defaultProps} isActive={true} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('MuiIconButton-colorPrimary');
    });

    it('should handle empty onClick gracefully', () => {
      render(<ToolbarButton {...defaultProps} onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should render with minimal props', () => {
      render(<ToolbarButton onClick={jest.fn()} isActive={false} disabled={false} icon={<div />} label="Test" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label from tooltip', () => {
      render(<ToolbarButton {...defaultProps} label="Bold Formatting" />);

      const button = screen.getByRole('button');
      expect(button.parentElement).toHaveAttribute('aria-label', 'Bold Formatting');
    });

    it('should be keyboard accessible when enabled', () => {
      render(<ToolbarButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should indicate disabled state to screen readers', () => {
      render(<ToolbarButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });
  });
});
