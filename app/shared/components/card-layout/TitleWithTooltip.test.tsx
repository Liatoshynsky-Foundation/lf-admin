import { render, screen, waitFor } from '@testing-library/react';

import TitleWithTooltip from './TitleWithTooltip';

globalThis.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(() => callback()),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

jest.mock('~/ds-components/tooltip/Tooltip', () => {
  return function MockTooltip({ title, children }: any) {
    return (
      <div data-testid="tooltip" data-title={title}>
        {children}
      </div>
    );
  };
});

describe('TitleWithTooltip', () => {
  const longText = 'This is a very long text that should be truncated';
  const shortText = 'Short text';

  const mockOffset = (scrollHeight: number, clientHeight: number) => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: scrollHeight
    });

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: clientHeight
    });
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders text correctly', () => {
    mockOffset(100, 50);

    render(<TitleWithTooltip text={shortText} />);

    expect(screen.getByText(shortText)).toBeInTheDocument();
  });

  it('shows tooltip when text is truncated', async () => {
    mockOffset(100, 50);

    render(<TitleWithTooltip text={longText} />);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-title', longText);
    });
  });

  it('does not show tooltip when text is not truncated', async () => {
    mockOffset(50, 100);

    render(<TitleWithTooltip text={shortText} />);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-title', '');
    });
  });
});
