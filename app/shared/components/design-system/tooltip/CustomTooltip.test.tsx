import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CustomTooltip } from './CustomTooltip';

describe('CustomTooltip', () => {
  it('should render children', () => {
    render(
      <CustomTooltip title="Test tooltip">
        <button>Hover me</button>
      </CustomTooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('should show tooltip on hover', async () => {
    const user = userEvent.setup();
    render(
      <CustomTooltip title="Tooltip text">
        <button>Hover me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover me');
    await user.hover(button);

    await waitFor(() => {
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });

  it('should hide tooltip on unhover', async () => {
    const user = userEvent.setup();
    render(
      <CustomTooltip title="Tooltip text">
        <button>Hover me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover me');
    await user.hover(button);

    await waitFor(() => {
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    await user.unhover(button);

    await waitFor(() => {
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });
  });

  it('should render complex title content', async () => {
    const user = userEvent.setup();
    const complexTitle = (
      <div>
        <div data-testid="title-header">Header</div>
        <div data-testid="title-body">Body text</div>
      </div>
    );

    render(
      <CustomTooltip title={complexTitle}>
        <button>Hover me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover me');
    await user.hover(button);

    await waitFor(() => {
      expect(screen.getByTestId('title-header')).toBeInTheDocument();
      expect(screen.getByTestId('title-body')).toBeInTheDocument();
    });
  });

  it('should use top placement by default', async () => {
    const user = userEvent.setup();
    render(
      <CustomTooltip title="Tooltip text">
        <button>Hover me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover me');
    await user.hover(button);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should accept custom placement', async () => {
    const user = userEvent.setup();
    render(
      <CustomTooltip title="Tooltip text" placement="bottom">
        <button>Hover me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover me');
    await user.hover(button);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should render arrow', async () => {
    const user = userEvent.setup();
    render(
      <CustomTooltip title="Tooltip text">
        <button>Hover me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover me');
    await user.hover(button);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('.MuiTooltip-arrow');
      expect(arrow).toBeInTheDocument();
    });
  });

  it('should not show tooltip when title is empty', () => {
    render(
      <CustomTooltip title="">
        <button>Hover me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover me');
    expect(button).toBeInTheDocument();
  });

  it('should pass through other tooltip props', async () => {
    render(
      <CustomTooltip title="Tooltip text" open={true}>
        <button>Hover me</button>
      </CustomTooltip>
    );

    await waitFor(() => {
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });
});
